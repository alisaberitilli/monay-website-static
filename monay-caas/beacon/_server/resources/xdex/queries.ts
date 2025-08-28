import { TRPCError } from "@trpc/server";
import z from "zod";

import config from "#server/config";
import { authProcedure, freeProcedure } from "#server/trpc";

import {
  findVendorAccountDetailsInput,
  xdexFetchDataInput,
  xdexFetchVenderCodeInput,
  xdexPaymentInput,
} from "./validators";

export const fetchVendorCodeDetails = freeProcedure
  .input(xdexFetchVenderCodeInput)
  .query(async ({ input, ctx: { log } }) => {
    const fetchXdexBillerApiPath =
      `${config.xdexApiPath}?CompCode='${input.companyCode}'` ||
      "http://test.monay.com/getVendorList?CompCode='1005'"; // this code should be value based on buyer
    console.log("API Path" + fetchXdexBillerApiPath);
    const fetchedResponse = await fetch(fetchXdexBillerApiPath, {
      method: "GET",

      // headers: {
      //     Content-Type: "application/json",
      // },
      // body: JSON.stringify({
      //   mobileNumber: mobileNumber,
      //   buyerCode: buyerCode,
      // }),
    });
    const fetchedData = await fetchedResponse.json();
    if (fetchedData.statusCode == 400) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch details from XDEX, message: ${fetchedData.message}`,
      });
    }
    log.info(`Output is below ${JSON.stringify(fetchedData)}`);
    return fetchedData;
  });

export const fetchXdexApi = freeProcedure
  .input(xdexFetchDataInput)
  //   .output(vUserOutput)
  .query(async ({ input: { mobileNumber, buyerCode }, ctx: { log } }) => {
    const fetchedResponse = await fetch(config.xdexApiPath, {
      method: "POST",
      // headers: {
      //     Content-Type: "application/json",
      // },
      body: JSON.stringify({
        mobileNumber: mobileNumber,
        buyerCode: buyerCode,
      }),
    });
    const fetchedData = await fetchedResponse.json();
    if (fetchedData.statusCode == 400) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch details from XDEX, message: ${fetchedData.message}`,
      });
    }
    log.info(`Output is below ${fetchedData}`);
    return fetchedData;
  });

export const xdexPayToMerchant = authProcedure
  .input(xdexPaymentInput)
  // .output()
  .query(async () => {});

export const getBillerDetails = authProcedure
  .input(
    z.object({
      billerId: z.string(),
    })
  )
  // .output()
  .query(async ({ input, ctx: { log, prisma } }) => {
    const billerDetails = await prisma.biller.findMany({
      where: {
        billerId: input.billerId,
      },
    });
    if (!billerDetails.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Biller details not found in db!",
      });
    }
    return billerDetails;
  });

export const findVendorAccountDetails = authProcedure
  .input(findVendorAccountDetailsInput)
  // .output()
  .mutation(async ({ input, ctx: { log } }) => {
    /**
     * TODO
     * Make a call to xdex to fetch account details using vendor code and company code
     * For now, I am studding the data
     */
    return {
      channelId: "TILLI",
      // "corpCode": "DEMOUPI3",
      corpCode: "DEMOCORP387",
      userId: "ACC0336231165147",
      apiVersion: "1.0",
      beneLEI: "98203456981298203456", //required when amt>5cr
      beneName: "Sangeetha Mobiles Pvt ltd",
      beneAccNum: "913020037625873",
      beneIfscCode: "HDFC0000523",
      beneAcType: "10",
      beneBankName: "HDFC Bank",
      beneAddr1: "",
      beneAddr2: "",
      beneAddr3: "",
      beneCity: "",
      beneState: "",
      benePincode: "506101",
      beneEmailAddr1: "Bhuvaneshwari@sangeethamobiles.com",
      beneMobileNo: "7719871404",
    };
  });
