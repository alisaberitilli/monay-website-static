import { TRPCError } from "@trpc/server";

import { dateToYyyyMmDd } from "#constants";
import config from "#server/config";
import { authProcedure, freeProcedure } from "#server/trpc";
import { env } from "#server/utils";

import { getRandomNumber } from "./helper";
import {
  addBillerInput,
  finalPayInput,
  updateBillerInfoInput,
  updateBillerInput,
  updatePayXdexInput,
  xdexPaymentInput,
} from "./validators";

export const updateBillerInfo = authProcedure
  .input(updateBillerInfoInput)
  .mutation(async ({ input, ctx: { log, prisma } }) => {
    const updateBiller = await prisma.biller.updateMany({
      where: {
        billerId: input.billerId ?? "",
      },
      data: {
        ...input,
      },
    });
    log.info("Biller info updated!!!", updateBiller);
    return updateBiller;
  });

// export const fetchXdexApi = authProcedure
//   .input(xdexFetchDataInput)
//   //   .output(vUserOutput)
//   .mutation(async ({ input: { mobileNumber, buyerCode }, ctx: { log } }) => {
//     const fetchXdexApiPath =
//       process.env.FETCHXDEXAPI || "https://test.monay.com/fetch";
//     const fetchedResponse = await fetch(fetchXdexApiPath, {
//       method: "POST",
//       // headers: {
//       //     Content-Type: "application/json",
//       // },
//       // body: JSON.stringify({
//       //   mobileNumber: mobileNumber,
//       //   buyerCode: buyerCode,
//       // }),
//     });
//     const fetchedData = await fetchedResponse.json();
//     if (fetchedData.statusCode == 400) {
//       throw new TRPCError({
//         code: "INTERNAL_SERVER_ERROR",
//         message: `Failed to fetch details from XDEX, message: ${fetchedData.message}`,
//       });
//     }
//     log.info(`Output is below ${JSON.stringify(fetchedData)}`);
//     return fetchedData;
//   });

export const updatePayXdex = authProcedure
  .input(updatePayXdexInput)
  // .output()
  .mutation(async ({ ctx: { log }, input }) => {
    const fetchedData = await fetch(config.xdexPayPath, {
      method: "POST",
      // headers: {
      //   Authorization: bearerToken,
      // },
      body: JSON.stringify({
        ...input,
      }),
    });
    const fetchedResponse = await fetchedData.json();
    if (fetchedResponse.statusCode == 400) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to update payment status to XDEX, message: ${fetchedResponse.message}`,
      });
    }
    log.info(`Output is below ${JSON.stringify(fetchedResponse)}`);
    return fetchedResponse;
  });

export const makePaymentXdex = authProcedure
  .input(xdexPaymentInput)
  // .output()
  .mutation(async ({ input, ctx: { log } }) => {
    // const { v4: uuidv4 } = require("uuid");
    /*
  Step-1. Call API Key Gen API
  Input: {
    sApiKey: 951752,
    userEmailId: sriramk@utilli.com
  }
  Output: {
    "apiKey": "826fb819-867d-40c9-9851-f0b425032a16",
    "secretKey": "f1d8aa24-8d53-4332-80bb-11c8773edf33",
    "statusCode": "200",
    "statusDesc": "success"
  }

  Step-2. Call Auth API
  input: {
    apiKey: apiKey from step-1,
    secretKey: secretKey from step-1
  }
  output: {
    "hasError": false,
      "statusMessage": {
          "code": "200",
          "type": "S",
          "message": "Success"
      },
      "data": {
          "gpsApiToken": "e4011737-2c31-4b32-8fe5-951b439b942a"
      }
  }

  step-3. Call register API
  input:
  headers: {
    gpsToken: gpsApiToken from step-2
    merchantId: merchantId
  }
  body: {
      "BeneficiaryRegistrationRequest": {
          "SubHeader": {
              "requestUUID": "ABC{{$timestamp}}", //uuid can be generated
              "serviceRequestId": "OpenAPI",
              "serviceRequestVersion": "1.0",
              "channelId": "TILLI"
          },
          "BeneficiaryRegistrationRequestBody": {
              "channelId": "TILLI",
              // "corpCode": "DEMOUPI3",
              "corpCode": "DEMOCORP387",
              "userId": "ACC0336231165147",
              "beneinsert": [
                  {
                      "apiVersion": "1.0",
                      "beneLEI": "98203456981298203456",
                      "beneCode": "{{beneCode}}",
                      "beneName": "Sangeetha Mobiles Pvt ltd",
                      "beneAccNum": "913020037625873",
                      "beneIfscCode": "HDFC0000523",
                      "beneAcType": "10",
                      "beneBankName": "HDFC Bank",
                      "beneAddr1": "",
                      "beneAddr2": "",
                      "beneAddr3": "",
                      "beneCity": "",
                      "beneState": "",
                      "benePincode": "506101",
                      "beneEmailAddr1": "Bhuvaneshwari@sangeethamobiles.com",
                      "beneMobileNo": "7719871404"
                  }
              ]
          }
      }
  }

  output:{
      "hasError": false,
      "statusMessage": {
          "code": "200",
          "type": "S",
          "message": "Success"
      },
      "data": {
          "data": {
              "checksum": "ad2b930885227876ea695c9b217b1cce",
              "beneDetails": [
                  {
                      "beneMobileNo": "7719871404",
                      "statusDesc": null,
                      "beneBankName": "HDFC Bank",
                      "beneName": "Sangeetha Mobiles Pvt ltd",
                      "beneIfscCode": "HDFC0000523",
                      "beneCode": "VEND628959",
                      "beneEmailAddr1": "Bhuvaneshwari@sangeethamobiles.com",
                      "corpCode": "DEMOCORP387",
                      "status": "ACTIVE",
                      "beneAccNum": "913020037625873"
                  }
              ]
          },
          "message": "Success",
          "status": "S"
      }
  }

  step-4. Call funTransfer API
  input: {
    headers: {
      gpsToken: gpsApiToken from step-2
      merchantId: mercahntId
    }
    body: {
      "TransferPaymentRequest": {
          "SubHeader": {
              "requestUUID": "ABC{{$timestamp}}", // uuid
              "serviceRequestId": "OpenAPI",
              "serviceRequestVersion": "1.0",
              "channelId": "TILLI"
          },
          "TransferPaymentRequestBody": {
              "channelId": "TILLI",
              // "corpCode": "DEMOUPI3",
              "corpCode": "DEMOCORP387", // for now hard-code
              "paymentDetails": [
                  {
                      "txnPaymode": "NE",
                      "custUniqRef": "{{crn}}", //generate uuid
                      // "corpAccNum": "248012910169",
                      "corpAccNum": "918020110872063", //from FE
                      "valueDate": "{{currentDate}}", //Date()
                      "txnAmount": "500.00", // from FE
                      "beneLEI": "98203456981298203456", // from FE
                      "beneName": "RANCO INDUSTRIES",// from FE
                      "beneCode": "{{beneCode}}", //// from FE
                      "beneAccNum": "913020037625873", // from FE
                      "beneAcType": "",
                      "beneAddr1": "",
                      "beneAddr2": "",
                      "beneAddr3": "",
                      "beneCity": "Mumbai",
                      "beneState": "Maharashtra",
                      "benePincode": "400101",
                      "beneIfscCode": "SBIN0007959",
                      "beneBankName": "STATE BANK OF INDIA",
                      "baseCode": "",
                      "chequeNumber": "",
                      "chequeDate": "",
                      "payableLocation": "",
                      "printLocation": "",
                      "beneEmailAddr1": "ranco@gmail.com",
                      "beneMobileNo": "7678429077",
                      "productCode": "",
                      "txnType": "",
                      "invoiceDetails": [
                          {
                              "invoiceAmount": "1888.00",
                              "invoiceNumber": "M713-DN",
                              "invoiceDate": "{{currentDate}}",
                              "cashDiscount": "0.00",
                              "tax": "0.00",
                              "netAmount": "1000.00",
                              "invoiceInfo1": "slfj13",
                              "invoiceInfo2": "20384lskdjf",
                              "invoiceInfo3": "lsdjf2903",
                              "invoiceInfo4": "0234sjdlf",
                              "invoiceInfo5": "ls0w392sdfk"
                          },
                          {
                              "invoiceAmount": "1888.00",
                              "invoiceNumber": "M713-EN",
                              "invoiceDate": "{{currentDate}}",
                              "cashDiscount": "0.00",
                              "tax": "0.00",
                              "netAmount": "1000.00",
                              "invoiceInfo1": "slfj13",
                              "invoiceInfo2": "20384lskdjf",
                              "invoiceInfo3": "lsdjf2903",
                              "invoiceInfo4": "0234sjdlf",
                              "invoiceInfo5": "ls0w392sdfk"
                          }
                      ],
                      "enrichment1": "",
                      "enrichment2": "",
                      "enrichment3": "",
                      "enrichment4": "",
                      "enrichment5": "",
                      "senderToReceiverInfo": ""
                  }
              ]
          }
      }
  }
  }

  */

    const authKeyGenAPIPath =
      "https://utillipayqa.utilli.com:9443/UtilliGPS/gps/merchant/api-key-generation";
    const authAPIpath =
      "https://utillipayqa.utilli.com:9443/UtilliGPS/gps/v2/api/login";
    const registerAPIPath =
      "https://utillipayqa.utilli.com:9443/UtilliGPS/payout/beneficiary/registration";
    const fundTransferAPIPath =
      "https://utillipayqa.utilli.com:9443/UtilliGPS/payout/beneficiary/fundTransfer";

    const merchantId = "4b29df6c-7acc-4232-9650-cf68c6bfe5ad"; //"4b29df6c-7acc-4232-9650-cf68c6bfe5ac"; //we need to fetch it from beacon-db

    const genApiAndSecKeys = await fetch(`${authKeyGenAPIPath}/${merchantId}`, {
      method: "GET",
      headers: {
        sApiKey: "951752",
        userEmailId: "sriramk@utilli.com",
      },
    });
    const { apiKey, secretKey, statusCode, statusDesc } =
      await genApiAndSecKeys.json();
    if ("200" !== statusCode) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get apiKey and secretKey, message: ${statusDesc}`,
      });
    }
    const genGpsApiKey = await fetch(`${authAPIpath}/${merchantId}`, {
      method: "GET",
      headers: {
        apiKey: apiKey,
        secretKey: secretKey,
      },
    });
    const genGpsApiKeyRes = await genGpsApiKey.json();
    // data: { gpsApiToken },
    // hasError,
    // statusMessage,
    if (genGpsApiKeyRes.hasError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get gpsApiToken, message: ${JSON.stringify(
          genGpsApiKeyRes.statusMessage
        )}`,
      });
    }

    const requestUUID = getRandomNumber(10); //"6103724499"; // 10 digit unique generated
    const beneCode = `VEND${getRandomNumber(6)}`; // "VEND374444";
    // const uuid = require("uuid");
    // const myUUID = uuid.v4();
    // const randomNumber = Math.round(
    //   Math.random() * Math.abs(999999 - 111111) + 111111
    // );
    // const beneCode = "VEND" + randomNumber;

    console.log("\n\n GPS API Key: " + genGpsApiKeyRes.data.gpsApiToken);
    const registerToPay = await fetch(registerAPIPath, {
      method: "POST",
      headers: {
        gpsToken: genGpsApiKeyRes.data.gpsApiToken,
        merchantId: merchantId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BeneficiaryRegistrationRequest: {
          SubHeader: {
            requestUUID: `ABC${requestUUID}`, //"ABC{{$timestamp}}", //uuid can be generated
            serviceRequestId: "OpenAPI",
            serviceRequestVersion: "1.0",
            channelId: "TILLI",
          },
          BeneficiaryRegistrationRequestBody: {
            channelId: "TILLI",
            // "corpCode": "DEMOUPI3",
            corpCode: "DEMOCORP387",
            userId: "ACC0336231165147",
            beneinsert: [
              {
                apiVersion: "1.0",
                beneLEI: "98203456981298203456", //required when amt>5cr
                beneCode: beneCode, //"{{beneCode}}",
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
              },
            ],
          },
        },
      }),
    });

    const registerToPayRes = await registerToPay.json();
    console.log("Rgister api response : " + JSON.stringify(registerToPayRes));
    // {
    //   hasError,
    //   statusMessage,
    //   data: { data },
    // }
    if (registerToPayRes.hasError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed in registering the benificery code, message: ${JSON.stringify(
          registerToPayRes
        )}`,
      });
    }

    log.info(
      {
        requestUUID,
        beneCode,
        gpsToken: genGpsApiKeyRes.data.gpsApiToken,
        merchantId: merchantId,
        registerToPayRes: {},
      },
      "makePaymentXdex return value"
    );

    return {
      requestUUID,
      beneCode,
      gpsToken: genGpsApiKeyRes.data.gpsApiToken,
      merchantId: merchantId,
      registerToPayRes: {},
    };
  });

export const makeFinalPayment = authProcedure
  // .meta()
  .input(finalPayInput)
  // .output()
  .mutation(
    async ({
      input: { gpsToken, merchantId, beneCode, requestUUID },
      ctx: { log },
    }) => {
      const fundTransferAPIPath =
        "https://utillipayqa.utilli.com:9443/UtilliGPS/payout/beneficiary/fundTransfer";

      const crn = Math.round(
        Math.random() * Math.abs(999999999 - 111111111) + 111111111
      );
      const currentDate = dateToYyyyMmDd(new Date());

      const fundTransfer = await fetch(fundTransferAPIPath, {
        method: "POST",
        headers: {
          gpsToken: gpsToken,
          merchantId: merchantId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TransferPaymentRequest: {
            SubHeader: {
              requestUUID: requestUUID, // "ABC{{$timestamp}}", // uuid
              serviceRequestId: "OpenAPI",
              serviceRequestVersion: "1.0",
              channelId: "TILLI",
            },
            TransferPaymentRequestBody: {
              channelId: "TILLI",
              // "corpCode": "DEMOUPI3",
              corpCode: "DEMOCORP387", // for now hard-code
              paymentDetails: [
                {
                  txnPaymode: "NE",
                  custUniqRef: crn, //"{{crn}}", //generate uuid
                  // "corpAccNum": "248012910169",
                  corpAccNum: "918020110872063", //from FE
                  valueDate: currentDate, //"{{currentDate}}", //Date()
                  txnAmount: "500.00", // from FE
                  beneLEI: "98203456981298203456", // from FE
                  beneName: "RANCO INDUSTRIES", // from FE
                  beneCode: beneCode, // "{{beneCode}}", //// from FE
                  beneAccNum: "913020037625873", // from FE
                  beneAcType: "",
                  beneAddr1: "",
                  beneAddr2: "",
                  beneAddr3: "",
                  beneCity: "Mumbai",
                  beneState: "Maharashtra",
                  benePincode: "400101",
                  beneIfscCode: "SBIN0007959",
                  beneBankName: "STATE BANK OF INDIA",
                  baseCode: "",
                  chequeNumber: "",
                  chequeDate: "",
                  payableLocation: "",
                  printLocation: "",
                  beneEmailAddr1: "ranco@gmail.com",
                  beneMobileNo: "7678429077",
                  productCode: "",
                  txnType: "",
                  invoiceDetails: [
                    {
                      invoiceAmount: "1888.00",
                      invoiceNumber: "M713-DN",
                      invoiceDate: currentDate, //}"`, // "{{currentDate}}",
                      cashDiscount: "0.00",
                      tax: "0.00",
                      netAmount: "1000.00",
                      invoiceInfo1: "slfj13",
                      invoiceInfo2: "20384lskdjf",
                      invoiceInfo3: "lsdjf2903",
                      invoiceInfo4: "0234sjdlf",
                      invoiceInfo5: "ls0w392sdfk",
                    },
                    {
                      invoiceAmount: "1888.00",
                      invoiceNumber: "M713-EN",
                      invoiceDate: currentDate, //}"`, //"{{currentDate}}",
                      cashDiscount: "0.00",
                      tax: "0.00",
                      netAmount: "1000.00",
                      invoiceInfo1: "slfj13",
                      invoiceInfo2: "20384lskdjf",
                      invoiceInfo3: "lsdjf2903",
                      invoiceInfo4: "0234sjdlf",
                      invoiceInfo5: "ls0w392sdfk",
                    },
                  ],
                  enrichment1: "",
                  enrichment2: "",
                  enrichment3: "",
                  enrichment4: "",
                  enrichment5: "",
                  senderToReceiverInfo: "",
                },
              ],
            },
          },
        }),
      });

      const fundTransferRes = await fundTransfer.json();
      if (fundTransferRes.hasError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed in final state-fun transfer, message: ${JSON.stringify(
            fundTransferRes
          )}`,
        });
      }
      console.log(
        "Fund transfer API response: " + JSON.stringify(fundTransferRes)
      );

      return fundTransferRes;
    }
  );

interface AddBillerInput {
  billerId: string;
  name?: string;
  companyCode?: string;
  organizationId?: string;
}
export const addBiller = authProcedure
  .input(addBillerInput)
  // .output()
  .mutation(async ({ input, ctx: { prisma, log } }) => {
    const narrowData = async () => {
      let fetchedData: AddBillerInput = { billerId: "" }; //FIXME: typeof fetchedData is above interface
      if ("MANUAL" === input.type) {
        fetchedData = input.data;
      } else {
        //TODO/FIXME: Call api to get biller details from the XDEX
        const fetchXdexBillerApiPath = "";
        const fetchedResponse = await fetch(fetchXdexBillerApiPath, {
          method: "GET",
        });
        const fetchedData = await fetchedResponse.json();
        if (fetchedData.statusCode == 400) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to fetch details from XDEX, message: ${fetchedData.message}`,
          });
        }
        log.info(`Output is below ${JSON.stringify(fetchedData)}`);
      }
      return fetchedData;
    };
    const fetchedData = await narrowData();

    const addBiller = await prisma.biller.create({
      data: {
        ...fetchedData,
      },
    });
    log.info(addBiller, "the above details is added to biller table!");
    return addBiller;
  });

export const updateBiller = authProcedure
  .input(updateBillerInput)
  // .output()
  .mutation(async ({ input, ctx: { log, prisma } }) => {
    let fetchedData; //FIXME: typeof fetchedData is above interface
    if ("MANUAL" === input.type) {
      fetchedData = input.data;
    } else {
      //TODO/FIXME: Call api to get biller details from the XDEX
      const fetchXdexBillerApiPath = "";
      const fetchedResponse = await fetch(fetchXdexBillerApiPath, {
        method: "GET",
      });
      const fetchedData = await fetchedResponse.json();
      if (fetchedData.statusCode == 400) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch details from XDEX, message: ${fetchedData.message}`,
        });
      }
      log.info(`Output is below ${JSON.stringify(fetchedData)}`);
    }
    const updateBillerDetails = await prisma.biller.update({
      where: {
        id: fetchedData?.billerId || "123", //FIXME: it is id and not billerId
      },
      data: {
        ...fetchedData,
      },
    });
    log.info(
      updateBillerDetails,
      "the above details is added to biller table!"
    );
    return updateBillerDetails;
  });
