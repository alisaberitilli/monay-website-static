import { Access, Locale, Prisma, PrismaClient } from "@prisma/client";
import { User, createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const supabaseClient = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
const prisma = new PrismaClient();

async function main() {
  const locales = JSON.parse(
    readFileSync(resolve(__dirname, "LOCALES.json"), "utf-8")
  );

  await prisma.country.deleteMany();
  await prisma.locale.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.address.deleteMany();

  const newLocales: Locale[] = await Promise.all(
    locales.data.map((locale) =>
      prisma.locale.create({
        data: {
          ...locale,
        },
      })
    )
  );

  const tilliAddress = await prisma.address.create({
    data: {
      googlePlacesId: "FAKE_PLACE_ID",
      jsonAddress: {},
      countryCode: "IND",
    },
  });

  const org = "Tilli";
  const user = "ibrahims@tilli.pro";
  const tilliOrg = await prisma.organization.create({
    data: {
      name: org,
      kybDoc: {
        create: {
          merchantName: org,
          subMerchantDba: org,
          taxId: "12-345668",
          website: "https://tilli.pro",
          phone: "",
          addressId: tilliAddress.id,
        },
      },
      roles: {
        create: [
          { ...DEFAULT_ROLE },
          { ...AGENT_ROLE },
          { ...SUPERVISOR_ROLE },
          { ...MANAGER_ROLE },
        ],
      },
      subscriberUnits: {
        create: {
          name: org,
        },
      },
      domains: {
        create: {
          testEmail: user,
          domain: user.split("@")[1],
        },
      },
    },
    include: {
      roles: true,
    },
  });

  await prisma.user.create({
    data: {
      email: user,
      name: "Ibrahim Ali",
      roleId: tilliOrg.roles.find((role) => role.role === "Manager")!.role,
      organizationId: tilliOrg.id,
      orgUser: {
        create: {
          organizationId: tilliOrg.id,
        },
      },
      flags: {
        create: {
          raw: {},
        },
      },
      prefs: {
        create: {},
      },
      nudgePrefs: {
        create: {},
      },
    },
  });

  const {
    data: { users: supabaseUsers },
  } = await supabaseClient.auth.admin.listUsers({
    perPage: 100,
  });

  if (!supabaseUsers.find((u: User) => u.email === user)) {
    await supabaseClient.auth.admin.createUser({
      email: user,
      user_metadata: {
        beacon_user: true,
        server_user_created: true,
        onboarding_complete: true,
      },
    });
  }
}

prisma.$connect().then(() =>
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    })
);

type CreateUserRole = Prisma.UserRoleCreateWithoutOrganizationInput;

export const DEFAULT_ROLE: CreateUserRole = {
  role: "None",
  isDefault: true,
  accessControl: {
    create: {
      organization: Access.NONE,
      users: Access.NONE,
    },
  },
};

const AGENT_ROLE: CreateUserRole = {
  role: "Agent",
  isWhitelistDefault: true,
  accessControl: {
    create: {
      billers: Access.READ,
      subscribers: Access.READ,
      subscriptions: Access.WRITE,
    },
  },
};

const SUPERVISOR_ROLE: CreateUserRole = {
  role: "Supervisor",
  accessControl: {
    create: {
      billers: Access.WRITE,
      subscribers: Access.WRITE,
      subscriptions: Access.WRITE,
      users: Access.WRITE,
      permissions: Access.READ,
    },
  },
};

const MANAGER_ROLE: CreateUserRole = {
  role: "Manager",
  accessControl: {
    create: {
      organization: Access.WRITE,
      billers: Access.WRITE,
      subscribers: Access.WRITE,
      subscriptions: Access.WRITE,
      users: Access.WRITE,
      permissions: Access.WRITE,
    },
  },
};
