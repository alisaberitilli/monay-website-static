require("dotenv").config();
// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();

async function main() {
  // const prices = await prisma.user.findMany({
  //   where: { createdAt: { lte: new Date() } },
  // });
  // console.log(prices);
}

main().finally(() => {
  console.info("DONE");
});

// const sdk = require("api")("@peopledatalabs/v5.0#1cn7d12l2es0d88");

// sdk.auth(process.env.COMPANY_API_KEY);
// sdk
//   .postV5CompanySearch({
//     query: JSON.stringify({
//       term: {
//         name: "washington gas",
//       },
//     }),
//     size: "10",
//     pretty: true,
//   })
//   .then(({ data }) => console.log(data, data.data[0].profiles));
