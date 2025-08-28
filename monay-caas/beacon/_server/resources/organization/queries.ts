import { authProcedure } from "#server/trpc";

import { vFindOrganization } from "./validators";

export const findExistingOrganization = authProcedure
  .output(vFindOrganization)
  .query(async ({ ctx: { prisma, authEmail } }) => {
    const domain = authEmail.split("@")[1];

    const existingOrganization = await prisma.emailDomain.findFirst({
      where: {
        domain,
      },
      include: {
        organization: {
          include: {
            address: true,
          },
        },
      },
    });

    return vFindOrganization.parse(existingOrganization?.organization);
  });
