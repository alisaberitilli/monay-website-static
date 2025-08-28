import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const TRANSIT_CSV_FILE_NAME = "FAKE_invoices.csv";
// const BILLER_JSON_FILE_NAME = "FAKE_billers.json";
// const ORG_JSON_FILE_NAME = "FAKE_orgs.json";

const transitFilePath = path.resolve(
  `${process.cwd()}/..`,
  TRANSIT_CSV_FILE_NAME
);
// const billerFilePath = path.resolve(
//   process.argv[2] ?? `${process.cwd()}/..`,
//   BILLER_JSON_FILE_NAME
// );
// const orgFilePath = path.resolve(
//   process.argv[2] ?? `${process.cwd()}/..`,
//   ORG_JSON_FILE_NAME
// );

const createHash = (hash: string) =>
  crypto
    .createHash("sha1")
    .update(hash)
    .digest("base64url")
    .toString()
    .slice(0, 12);

const invoicesCsvFile: string = fs.readFileSync(transitFilePath, "utf-8");
const lines = invoicesCsvFile
  .split("\n")
  .map((line) =>
    (line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) ?? []).map((s) =>
      s.replace(/"/gi, "")
    )
  );

type Biller = {
  id: string;
  accounts: Record<string, Account>;
};

type Account = {
  id: string;
  contract: string;
  serviceType: string;
  subscriberId: string;
  invoices: {
    id: string;
    type: string;
    amount: number;
    date: Date;
  }[];
};

type Org = Record<string, { id: string; pId: string; name: string }>;

const billers: Record<string, Biller> = {};
const orgs: Org = {};
let replacedOrg = "";

const cOrg = (org: string) => {
  if (!orgs[org]) {
    if (Object.keys(orgs).length === 0) {
      orgs[org] = {
        id: createHash("Tilli"),
        name: "Tilli",
        pId: "",
      };
      replacedOrg = org;
    } else {
      orgs[org] = {
        id: createHash(org),
        name: org,
        pId: "",
      };
    }
  }

  return orgs[org];
};
const buildBillers = () => {
  lines
    .slice(1)
    .forEach(
      ([
        InvoiceID,
        Biller,
        Organization,
        ServiceType,
        Account,
        Contract,
        Amount,
        InvoiceDate,
      ]) => {
        if (Biller) {
          const invoice = {
            id: InvoiceID,
            type: ServiceType,
            amount: parseFloat(Amount),
            date: new Date(InvoiceDate),
          };
          if (!billers[Biller]) {
            billers[Biller] = {
              id: createHash(Biller),
              accounts: {
                [Account]: {
                  subscriberId: cOrg(Organization).id,
                  id: createHash(Organization + Biller),
                  serviceType: ServiceType,
                  contract: Contract,
                  invoices: [invoice],
                },
              },
            };
          } else if (!billers[Biller].accounts[Account]) {
            billers[Biller].accounts[Account] = {
              contract: Contract,
              invoices: [invoice],
              subscriberId: cOrg(Organization).id,
              id: createHash(Organization + Biller),
              serviceType: ServiceType,
            };
          } else {
            billers[Biller].accounts[Account].invoices.push(invoice);
          }
        }
      }
    );
};

(async () => {
  const prisma = new PrismaClient();
  await prisma.$connect();

  buildBillers();

  const tilliOrg = await prisma.organization.findFirst({
    where: { name: "Tilli" },
    include: { subscriberUnits: true },
  });
  if (tilliOrg) {
    orgs[replacedOrg].pId = tilliOrg?.subscriberUnits?.[0]?.id ?? "";
  }

  if (process.argv.includes("--reset") || process.argv.includes("-R")) {
    console.log(
      "Resetting biller, account, subscriber, contract, and invoice tables"
    );
    console.log("Deleting invoices...");
    await prisma.invoice.deleteMany();
    console.log("Deleting contracts...");
    await prisma.contract.deleteMany();
    console.log("Deleting accounts...");
    await prisma.account.deleteMany();
    console.log("Deleting billers...");
    await prisma.biller.deleteMany();
    console.log("Deleting subscribers...");
    await prisma.subscriber.deleteMany({ where: { name: { not: "Tilli" } } });
  }

  const newOrgs = await Promise.allSettled(
    Object.entries(orgs).map(async ([Organization, data]) => {
      const { id } = data as { id: string };

      let sub = await prisma.subscriber.findFirst({
        where: { subscriberId: id },
      });

      if (sub) {
        console.log("Already found subscriber with id", id, "...skipping...");
        orgs[Organization].pId = sub.id;
        return;
      } else if (data.name === "Tilli") {
        await prisma.subscriber.updateMany({
          where: { name: "Tilli" },
          data: { subscriberId: id },
        });
      } else {
        sub = await prisma.subscriber.create({
          data: { subscriberId: id, name: Organization },
        });
        orgs[Organization].pId = sub.id;
      }

      return sub;
    })
  );

  const newBillers = await Promise.allSettled(
    Object.entries(billers).map(async ([biller, data]) => {
      const { id } = data as {
        id: string;
      };

      const accounts = Object.values(
        (data as { accounts: Record<string, Account> }).accounts
      ) as Account[];

      let newBiller = await prisma.biller.findFirst({
        where: { billerId: id },
      });

      if (!newBiller) {
        newBiller = await prisma.biller.create({
          data: {
            billerId: id,
            name: biller,
            companyCode: id,
            source: "SCRIPT",
          },
        });
      } else {
        console.log("Already found biller with id", id, "...skipping...");
      }

      const res = await Promise.all(
        accounts.map(async (acct) => {
          const { id, contract, invoices, subscriberId, serviceType } = acct;
          const org = (
            Object.entries(orgs) as [
              string,
              { id: string; name: string; pId: string }
            ][]
          ).find(([i, { id, name }]) => subscriberId === id);

          if (org && org[1] && org[1].pId) {
            const account = await prisma.account.create({
              data: {
                accountId: id,
                billerId: newBiller!.id,
                subscriberId: org[1].pId,
                contracts: {
                  create: {
                    id: contract,
                  },
                },
              },
            });

            const invs = await Promise.allSettled(
              invoices.map((invoice) =>
                prisma.invoice.create({
                  data: {
                    accountId: account.id,
                    invoiceNum: invoice.id,
                    amount: invoice.amount,
                    invoiceDate: invoice.date,
                    dueDate: new Date(
                      invoice.date.valueOf() + 1000 * 60 * 60 * 24 * 7
                    ),
                  },
                })
              )
            );
            if (invs.some((i) => i.status === "rejected")) {
              console.log(invs.filter((i) => i.status === "rejected"));
            }
          } else {
            return;
          }
          return;
        })
      );
      return "MADE NEW";
    })
  );
})()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {
    process.exit(0);
  });
