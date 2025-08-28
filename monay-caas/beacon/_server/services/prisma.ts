// TODO: add RLS https://github.com/prisma/prisma-client-extensions/tree/main/row-level-security
import { Prisma, PrismaClient } from "@prisma/client";

import log, { stdWarn } from "#server/log";

const basePrisma = new PrismaClient();

export const forUser = (userId: string, token?: string) => {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      name: "USER_ID",
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId.toString()}, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    })
  );
};

const PRISMA_MODELS = Prisma.dmmf.datamodel.models.map((model) => model.name);
const LIMITED_MODELS = [
  "User",
  "Organization",
  "Faq",
  "ApplicationInput",
  "Country",
  "Industry",
  "Locale",
];
const ALLOWED_LIMITED_PRISMA_MODELS = PRISMA_MODELS.filter((model) =>
  LIMITED_MODELS.includes(model)
);
if (
  LIMITED_MODELS.some((model) => !PRISMA_MODELS.includes(model)) &&
  process.env.NODE_ENV === "development"
) {
  stdWarn("UNKNOWN MODELS DETECTED IN LIMITED PRISMA CLIENT");
  log.info(
    {
      models: LIMITED_MODELS.filter((model) => !PRISMA_MODELS.includes(model)),
    },
    "Mismatched models:"
  );
}

export const limitedPrisma = basePrisma.$extends({
  name: "LIMITED_FEATURES_EXT",
  query: {
    $allOperations({ model, operation, args, query }) {
      log.info(operation, `Running unauth op with model ${model}`);
      if (model === "User") {
        // allowed operations on user model
        if (operation !== "findUnique") {
          throw new Error(
            "Illegal operation on unauth'd prisma client: only findUnique is allowed on user model"
          );
        } else {
          // ONLY allow selecting email field and querying for email.
          const argKeys = Object.keys(args);
          if (argKeys.some((key) => key !== "where" && key !== "select")) {
            throw new Error(
              "Illegal operation on unauth'd prisma client: only where and select statements allowed on user model"
            );
          }
          if (args.where) {
            const whereEntries = Object.entries(args.where);
            if (
              !(whereEntries.length === 1 && whereEntries[0][0] === "email")
            ) {
              throw new Error(
                "Illegal operation on unauth'd prisma client: where clause in user findUnique statement only expects email field"
              );
            }
          }
          if (args.select) {
            const selectEntries = Object.entries(args.select);
            if (
              !(selectEntries.length === 1 && selectEntries[0][0] === "email")
            ) {
              throw new Error(
                "Illegal operation on unauth'd prisma client: select clause in user findUnique statement only expects email field"
              );
            }
          }
        }
      } else if (model === "Organization") {
        // only allow querying for domain access
        if (operation !== "findMany") {
          throw new Error(
            "Illegal operation on unauth'd prisma client: only findMany is allowed on organization model"
          );
        } else {
          const argKeys = Object.keys(args);
          if (argKeys.some((key) => key !== "where" && key !== "select")) {
            throw new Error(
              "Illegal operation on unauth'd prisma client: only where and select statements allowed on organization model"
            );
          }

          if (args.where) {
            const whereEntries = Object.entries(args.where);
            if (
              !(whereEntries.length === 1 && whereEntries[0][0] === "domains")
            ) {
              throw new Error(
                "Illegal operation on unauth'd prisma client: where clause in organization findMany statement only expects domains field"
              );
            }
          }
          if (args.select) {
            const selectEntries = Object.entries(args.select);
            if (
              !(selectEntries.length === 1 && selectEntries[0][0] === "domains")
            ) {
              throw new Error(
                "Illegal operation on unauth'd prisma client: select clause in organization findMany statement only expects domains field"
              );
            }
          }
        }
      } else if (model && !ALLOWED_LIMITED_PRISMA_MODELS.includes(model)) {
        throw new Error(
          "Illegal operation on unauth'd prisma client: illegal model invoked"
        );
      }
      return query(args);
    },
  },
});

export const prisma = basePrisma.$extends({
  name: "BASE_EXT",
  query: {
    user: {
      async $allOperations({ args, query, operation }) {
        if (operation === "delete" || operation === "deleteMany") {
          if (operation === "delete") operation = "update";
          if (operation === "deleteMany") operation = "updateMany";

          return query({
            ...args,
            data: {
              deactivatedAt: new Date(),
            },
          });
        }

        if (
          (operation !== "findUnique" && operation === "findFirst") ||
          operation === "findMany"
        ) {
          args = args as Extract<typeof args, { where?: unknown }>;

          const deactivatedAt = (args.where as Prisma.UserWhereInput)
            .deactivatedAt;

          return query({
            ...args,
            where: {
              deactivatedAt: deactivatedAt ?? null,
              ...args.where,
            },
          });
        }

        if (operation === "findUnique") {
          const user = await query({
            ...args,
            select: (args as Prisma.UserArgs).select
              ? {
                  deactivatedAt: true,
                  ...(args as Prisma.UserArgs).select,
                }
              : undefined,
          });
          if (
            user &&
            typeof user === "object" &&
            "deactivatedAt" in user &&
            !!user.deactivatedAt
          ) {
            return null;
          }
          return user;
        }

        return query(args);
      },
    },
    // for building out a potential "if this model has a deletedAt field, delete that way."" no way to automagically detect this however so we'll have to enumerate the model list somehow else
    // $allModels: {
    //   $allOperations({ args, query, operation, model }) {
    //     const context = Prisma.getExtensionContext(this);

    //     return query(args);
    //   },
    // },
  },
  result: {
    user: {},
  },
});

export default prisma;
export type AuthPrisma = typeof prisma;
