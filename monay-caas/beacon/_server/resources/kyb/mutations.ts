// import { TRPCError } from "@trpc/server";
// // import { array } from "zod";
// import { Base64Encode } from "base64-stream";

// import { authProcedure } from "#server/trpc";

// // import { z } from "zod";
// import {
//   inputAddBusinessInformation,
//   inputAddContactInformation,
//   inputAddotherInformation,
//   inputBillingInfo,
//   inputKyBSubmit,
// } from "./validators";

// const getImageDataFromUrl = (url: string) => {
//   return fetch(url).then((res) => {
//     return new Promise((resolve, reject) => {
//       let chunks: unknown[] = [];
//       const myStream = res.body?.pipe(new Base64Encode());
//       myStream.on("data", (chunk: unknown) => {
//         chunks = chunks.concat(chunk);
//       });
//       myStream.on("end", () => {
//         resolve(chunks.toString("base64"));
//       });
//     });
//   });
// };

// // KYB for US
// export const kycSubmitToGPSUS = authProcedure
//   .input(inputKyBSubmit)
//   // .output()
//   .mutation(async ({ input, ctx: { authEmail, prisma, log } }) => {
//     const bearerToken =
//       "Bearer " + input.gpsToken ??
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFydmluZGsrYmVhY29uaW5kM0B0aWxsaS5wcm8iLCJ1c2VyX2lkIjoiOTZmNmIzYjgtMThkYi00MTBjLTgyZTQtOTVmNjRiM2U3ZjgzIiwic3ViX2FjY291bnRfaWQiOiIwOGRhMTIzOC0wMmVjLTRmNjgtODNmYi04MjhiM2RjZWFmN2EiLCJzZXNzaW9uX2lkIjoiOWIwNmI5NzYtMmFkYS00ZmVhLWI2MjQtM2Y4MThlZTIwOWI5IiwiaWF0IjoxNjkwNDU0NTcxLCJleHAiOjE2OTA1MDg1NzF9._TmM6yRz1bL8RmFySZs7gMV7M7E15krbzd3q5Rqqi18";
//     const kybDocument = await prisma.kybDocument.findUnique({
//       where: {
//         id: input.kybDocId,
//       },
//       include: {
//         address: {
//           include: {
//             country: true,
//           },
//         },
//         owners: {
//           include: {
//             address: {
//               include: {
//                 country: true,
//               },
//             },
//           },
//         },
//         localeData: {
//           include: {
//             kybLocaleUs: true,
//           },
//         },
//         billToAddress: {
//           include: {
//             country: true,
//           },
//         },
//         keyManagement: true,
//       },
//     });
//     if (!kybDocument) {
//       throw new TRPCError({
//         code: "NOT_FOUND",
//         message: "no kyb data found, please check kyb doc id",
//       });
//     }

//     // const businessAddress = kybDocument?.address ?? { jsonAddress: {} };
//     // const { address, country_code, state_code, city_code, zip } =
//     //   businessAddress.jsonAddress as AddressObject;
//     // try {
//     //   const gpsBusinessinfoCreateResponse = await fetch(
//     //     "https://qaapi1.monay.com/v1/kyc/business_info",
//     //     {
//     //       method: "POST",
//     //       headers: {
//     //         Authorization: bearerToken,
//     //       },
//     //       body: JSON.stringify({
//     //         business_legal_name: kybDocument.merchantName,
//     //         tax_id: kybDocument.taxId,
//     //         dba: kybDocument.subMerchantDba,
//     //         web_url: kybDocument.website,
//     //         //address
//     //         address_type: "BUSINESS",
//     //         address: address,
//     //         country_code: country_code,
//     //         state_code: state_code,
//     //         city_code: city_code,
//     //         zip: zip,

//     //         category_id: "kyc_01",
//     //         tel_phone: kybDocument?.phone || "",
//     //         is_landline: false,
//     //         ccc: kybDocument.address?.country.callingCode,
//     //         is_primary: true,
//     //         is_subAccount: false,
//     //       }),
//     //     }
//     //   );
//     //   if (!gpsBusinessinfoCreateResponse.ok) {
//     //     throw new TRPCError({
//     //       code: "INTERNAL_SERVER_ERROR",
//     //       message: "Submitting Business Doc to GPS Failed",
//     //     });
//     //   }

//       //Get KYB owner details
//       const kybOwnerDetails = kybDocument.owners;
//       if (!kybOwnerDetails.length) {
//         throw new TRPCError({
//           code: "NOT_FOUND",
//           message: "KYB Owner details not found!",
//         });
//       }

//       kybOwnerDetails.map(async (item) => {
//         //now try to submit the owner info
//         if (!item.name) {
//           throw new TRPCError({
//             code: "NOT_FOUND",
//             message: "name not found for the kyb owner",
//           });
//         }
//         const [firstName, ...last_name] = item.name.split(" ");
//         const lastName = last_name.join(" ");
//         let aadhar = null;
//         let passport = null;
//         let ssn = null;
//         // const licence = null;
//         if (item.piiType == "AADHAR") {
//           aadhar = item.pii || "";
//         } else if (item.piiType == "PASSPORT") {
//           passport = item.pii || "";
//         } else {
//           ssn = item.pii;
//         }
//         let nonUS = true;
//         if (item.address?.countryCode == "+1") {
//           nonUS = false;
//         }
//         // const { address, state_code, city_code, zip } = JSON.parse(
//         //   item?.address?.jsonAddress
//         // );
//         const businessAddress = item?.address ?? { jsonAddress: {} };
//         const { address, state_code, city_code, zip } =
//           businessAddress.jsonAddress as AddressObject;
//         const gpsCreateOwnerInfo = await fetch(
//           "https://qaapi1.monay.com/v1/kyc/contact",
//           {
//             method: "POST",
//             headers: {
//               Authorization: bearerToken,
//             },
//             body: JSON.stringify({
//               category_id: "kyc_02",
//               count: kybDocument.locationCount,
//               title: item?.title,
//               email: item.email,
//               first_name: firstName,
//               last_name: lastName,
//               full_name: item.name,
//               dob: item.dob,
//               percentage_ownership: item.ownershipPct,
//               ssn: ssn,
//               aadhar: aadhar,
//               passport: passport,
//               non_us: nonUS,
//               personal_guarantee: "YES",
//               phone_number: item.mobile,
//               ccc: item.address?.country.callingCode,
//               address: {
//                 country_code: item.address?.countryCode,
//                 state_code: state_code,
//                 city_code: city_code,
//                 zip: zip,
//                 address: address,
//                 address_type: "PERSONAL",
//               },
//               kyc: {
//                 type: item.piiUploadType,
//                 front: item.piiUpload1,
//                 back: item.piiUpload2,
//                 document_name: item.piiUploadName1 ?? "kyc_front",
//                 document_name_back: item.piiUploadName2 ?? "kyc_back",
//               },
//             }),
//           }
//         );
//         if (!gpsCreateOwnerInfo.ok) {
//           throw new TRPCError({
//             code: "INTERNAL_SERVER_ERROR",
//             message: "Submitting Owner-info to GPS Failed",
//           });
//         } else {
//           log.info(
//             `Owner details submitted to GPS and output is ${gpsCreateOwnerInfo}`
//           );
//         }
//       });
//       const submitOtherInfo = await fetch(
//         "https://qaapi1.monay.com/v1/kyc/other_info",
//         {
//           method: "POST",
//           headers: {
//             Authorization: bearerToken,
//           },
//           body: JSON.stringify({
//             category_id: "kyc_03",
//             business_primary_line: kybDocument.primaryBusiness ?? "",
//             backcard_sales_1yr: kybDocument.firstYearSalesVol ?? "",
//             average_ticket_size: kybDocument.averageTxAmt ?? "",
//             order_processing_type: kybDocument.posType ?? "",
//             order_processing_percentage: kybDocument.posPct ?? "0",
//           }),
//         }
//       );
//       if (!submitOtherInfo.ok) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Submitting Owner-info to GPS Failed",
//         });
//       } else {
//         log.info(
//           `Other details for KYB submitted to GPS and output is ${submitOtherInfo}`
//         );
//       }

//       let bodyData = null;
//       if (kybDocument.localeData?.kybLocaleUs?.isTicker) {
//         bodyData = {
//           is_authorised_cb: kybDocument.localeData.kybLocaleUs.isAuthorisedCb,
//           is_ticker: true,
//           ticker_symbol: kybDocument.localeData.kybLocaleUs.tickerSymbol,
//         };
//       } else {
//         const resumeData: string[] = [];
//         kybDocument.keyManagement.map(async (item) => {
//           //upload docs to gps using file/upload api and
//           if (!item.resumeUrl) {
//             throw new TRPCError({
//               code: "NOT_FOUND",
//               message: "Resume url must exist!!",
//             });
//           }
//           const base64Data = await getImageDataFromUrl(item.resumeUrl);
//           const { id, document_name } = await (
//             await fetch("https://qaapi1.monay.com/v1/kyc/file_upload", {
//               method: "POST",
//               headers: {
//                 authorization: bearerToken,
//               },
//               body: JSON.stringify({
//                 document_name: "resumeOKybManager",
//                 file: base64Data,
//                 document_type: "LIST_OF_KEY_MANAGEMENT",
//                 img_type: "",
//               }),
//             })
//           ).json();
//           // const { id, document_name } = uploadFileTOGPS;
//           resumeData.push(
//             JSON.stringify({
//               bio_id: id ?? "",
//               bio_name: document_name ?? "",
//               name: item.name ?? "",
//               profile_link: item.linkedinUrl ?? "",
//               title: item.title ?? "",
//               uploadedResume: id ?? false,
//             })
//           );
//         });
//         bodyData = {
//           business_legal_name: kybDocument.merchantName ?? "",
//           business_description: kybDocument.primaryBusiness ?? "",
//           //
//           business_type: kybDocument.businessType ?? "",
//           product_sold: kybDocument.productsAndServices ?? "string",
//           //
//           background_info: kybDocument.backgroundInfo,
//           key_management: "",
//           // ticker_symbol: "string", //not required
//           category_id: "", //done -> no input required
//           background_info_id: "string", // document type = "BACK_GROUND_INFO_AND_PRINCIPLES"
//           key_management_id: "string",

//           //kyb docs
//           corporate_overview_investor_management_id: "string", //upload docs and then id here
//           two_year_of_fiscal_year_financial_statement_id: "string", //upload docs and then id here
//           interim_financial_statement_id: "string", //upload docs and then id here
//           copy_of_void_check_id: "string", //upload docs and then id here
//           merchant_processing_statement_id: "string", //upload docs and then id here
//           third_p_and_l_projection_id: "string", //upload docs and then id here

//           //
//           is_authorised_cb:
//             kybDocument.localeData?.kybLocaleUs?.isAuthorisedCb ?? true,
//           is_ticker: false,
//           resumeData: resumeData, //upload the data here from the ListOfKeyMgmt table
//         };
//       }
//       //submitting the Financoial Documentation
//       const submitFinancialDocs = await fetch(
//         "https://qaapi1.monay.com/v1/add_financial_docs",
//         {
//           method: "POST",
//           headers: {
//             Authorization: bearerToken,
//           },
//           body: JSON.stringify({ ...bodyData }),
//         }
//       );
//       if (!submitFinancialDocs.ok) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Submitting Financial Doc to GPS Failed",
//         });
//       } else {
//         log.info(
//           `Financial details for KYB submitted to GPS and output is ${submitFinancialDocs}`
//         );
//       }

//       //bill to address
//       // const { address, country_code, state_code, city_code, zip } =
//       //   businessAddress.jsonAddress as Address;
//       const billToAddress = kybDocument?.address ?? { jsonAddress: {} };
//       const { address, state_code, city_code, zip } =
//         billToAddress.jsonAddress as AddressObject;

//       //submit boarding form
//       const submitBoardingForm = await fetch(
//         "https://qaapi1.monay.com/v1/kyc/boarding",
//         {
//           method: "POST",
//           headers: {
//             Authorization: bearerToken,
//             body: JSON.stringify({
//               boarding_type: "NEW_LOCATION", // it is default right now in GPS
//               location_count: kybDocument.locationCount ?? 0,
//               merchant_type: kybDocument.businessType ?? "", //not present
//               state_inc: kybDocument.incorporationState ?? "", // state in which company is legaly incorporated
//               month_year_incorporated: kybDocument.incorporationDate ?? "",
//               tin_type: kybDocument.taxIdType ?? "", //either SSN/EIN/?
//               irs_filing_name: kybDocument.taxName ?? "", //Company's name registered in Internal Revenue Service (IRS) for the administration of tax laws.

//               //dba details
//               dba_name: kybDocument.dbaContactName ?? "",
//               dba_contact: kybDocument.dbaNumber ?? "",
//               ccc_dba_contact: "string",

//               //this is business address
//               address: {
//                 country_code: "string",
//                 state_code: "string",
//                 city_code: "string",
//                 zip: "string",
//                 address: "string",
//                 address_type: "BUSINESS",
//               },
//               phone_number: "string",
//               ccc: "string",
//               is_landline:
//                 kybDocument.dbaContactType == "MOBILE" ? false : true,
//               retail_descriptor: kybDocument.retailDescriptor ?? "",
//               cust_svc: "string", //phone number of customer
//               ccc_cust_svc: "string", //ccc of customer phone no.

//               //billing details
//               bill_to_name: kybDocument.billToName ?? "",
//               bill_to_contact_name: kybDocument.billToContactName ?? "",
//               bill_to_phone: kybDocument.billToPhone ?? "",
//               ccc_bill_to_phone: "string",
//               is_same_address: false,
//               bill_address: {
//                 state_code: state_code ?? "",
//                 city_code: city_code ?? "",
//                 zip: zip ?? "",
//                 address: address ?? "",
//                 country_code: kybDocument.billToAddress?.countryCode ?? "",
//                 address_type: "BILLING",
//               },

//               //
//               visa_anual_volume: "string",
//               visa_average_ticket: "string",
//               full_anual_volume: "string",
//               full_average_ticket: "string",
//             }),
//           },
//         }
//       );

//       if (!submitBoardingForm.ok) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Submitting Owner-info to GPS Failed",
//         });
//       } else {
//         log.info(
//           `Other details for KYB submitted to GPS and output is ${submitBoardingForm}`
//         );
//       }

//       //submit Billing Info to GPS
//       const submitBillingInfo = await fetch(
//         "https://qaapi1.monay.com/v1/billing/details",
//         {
//           method: "POST",
//           headers: {
//             Authorization: bearerToken,
//           },
//           body: JSON.stringify({
//             fee_model: kybDocument.feeModel,
//             company_identifier: "string",
//             company_name: kybDocument.merchantName,
//             company_fax: "string",
//             company_fax_ccc: "string",
//             company_signature: "string",
//             company_logo: "string",
//             company_sign_file_name: "string",
//             company_logo_file_name: "string",

//             customer_service_email: kybDocument.customerServiceEmail,

//             dba_number: kybDocument.dbaNumber,
//             //url of social medias
//             url_facebook: kybDocument.facebookUrl,
//             url_twitter: kybDocument.twitterUrl,
//             url_instagram: kybDocument.instagramUrl,
//             //bank details
//             bank_routing_number: "string", //IFSC code
//             bank_account_number: "string",
//             account_type: "string",
//             check_type: "string",
//             check_number: "string",

//             //phone details
//             phone_number: "string",
//             ccc: "string",
//           }),
//         }
//       );
//       if (!submitBillingInfo.ok) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Submitting Billing-Info to GPS Failed",
//         });
//       } else {
//         log.info(
//           `Billing-Info details for KYB submitted to GPS and output is ${submitBillingInfo}`
//         );
//       }
//     } catch (error) {
//       return error;
//     }
//   });

// // KYB for India
// export const kycSubmitToGPSInd = authProcedure
//   .input(inputKyBSubmit)
//   // .output()
//   .mutation(async ({ input, ctx: { authEmail, prisma, log } }) => {
//     const bearerToken =
//       "Bearer " + input.gpsToken ??
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFydmluZGsrYmVhY29uaW5kM0B0aWxsaS5wcm8iLCJ1c2VyX2lkIjoiOTZmNmIzYjgtMThkYi00MTBjLTgyZTQtOTVmNjRiM2U3ZjgzIiwic3ViX2FjY291bnRfaWQiOiIwOGRhMTIzOC0wMmVjLTRmNjgtODNmYi04MjhiM2RjZWFmN2EiLCJzZXNzaW9uX2lkIjoiOWIwNmI5NzYtMmFkYS00ZmVhLWI2MjQtM2Y4MThlZTIwOWI5IiwiaWF0IjoxNjkwNDU0NTcxLCJleHAiOjE2OTA1MDg1NzF9._TmM6yRz1bL8RmFySZs7gMV7M7E15krbzd3q5Rqqi18";
//     const kybDocument = await prisma.kybDocument.findUnique({
//       where: {
//         id: input.kybDocId,
//       },
//       include: {
//         address: {
//           include: {
//             country: true,
//           },
//         },
//         owners: {
//           include: {
//             address: {
//               include: {
//                 country: true,
//               },
//             },
//           },
//         },
//         localeData: {
//           include: {
//             kybLocaleIndia: true,
//             kybLocaleUs: true,
//           },
//         },
//         billToAddress: {
//           include: {
//             country: true,
//           },
//         },
//         keyManagement: true,
//       },
//     });
//     if (!kybDocument) {
//       throw new TRPCError({
//         code: "NOT_FOUND",
//         message: "no kyb data found, please check kyb doc id",
//       });
//     }

//     try {
//       const businessAddress = kybDocument?.address ?? { jsonAddress: {} };
//       const { address, country_code, state_code, city_code, zip } =
//         businessAddress.jsonAddress as AddressObject;
//       const gpsBusinessinfoCreateResponse = await fetch(
//         "https://qaapi1.monay.com/v1/kyc/business_info",
//         {
//           method: "POST",
//           headers: {
//             Authorization: bearerToken,
//           },
//           body: JSON.stringify({
//             business_legal_name: kybDocument.merchantName,
//             tax_id: kybDocument.taxId,
//             dba: kybDocument.subMerchantDba,
//             web_url: kybDocument.website,
//             //address
//             address_type: "BUSINESS",
//             address: address,
//             country_code: country_code,
//             state_code: state_code,
//             city_code: city_code,
//             zip: zip,

//             category_id: "kyc_01",
//             tel_phone: kybDocument?.phone || "",
//             is_landline: false,
//             ccc: kybDocument.address?.country.callingCode,
//             is_primary: true,
//             is_subAccount: false,
//           }),
//         }
//       );
//       if (!gpsBusinessinfoCreateResponse.ok) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Submitting Business Doc to GPS Failed",
//         });
//       }

//       //Get KYB owner details
//       const kybOwnerDetails = kybDocument.owners;
//       if (!kybOwnerDetails.length) {
//         throw new TRPCError({
//           code: "NOT_FOUND",
//           message: "KYB Owner details not found!",
//         });
//       }

//       kybOwnerDetails.map(async (item) => {
//         //now try to submit the owner info
//         if (!item.name) {
//           throw new TRPCError({
//             code: "NOT_FOUND",
//             message: "name not found for the kyb owner",
//           });
//         }
//         const [firstName, ...last_name] = item.name.split(" ");
//         const lastName = last_name.join(" ");
//         let aadhar = null;
//         let passport = null;
//         let ssn = null;
//         // const licence = null;
//         if (item.piiType == "AADHAR") {
//           aadhar = item.pii || "";
//         } else if (item.piiType == "PASSPORT") {
//           passport = item.pii || "";
//         } else {
//           ssn = item.pii;
//         }
//         let nonUS = true;
//         if (item.address?.countryCode == "+1") {
//           nonUS = false;
//         }
//         // const { address, state_code, city_code, zip } = JSON.parse(
//         //   item?.address?.jsonAddress
//         // );
//         const businessAddress = item?.address ?? { jsonAddress: {} };
//         const { address, state_code, city_code, zip } =
//           businessAddress.jsonAddress as AddressObject;
//         const gpsCreateOwnerInfo = await fetch(
//           "https://qaapi1.monay.com/v1/kyc/contact",
//           {
//             method: "POST",
//             headers: {
//               Authorization: bearerToken,
//             },
//             body: JSON.stringify({
//               category_id: "kyc_02",
//               count: kybDocument.locationCount,
//               title: item?.title,
//               email: item.email,
//               first_name: firstName,
//               last_name: lastName,
//               full_name: item.name,
//               dob: item.dob,
//               percentage_ownership: item.ownershipPct,
//               ssn: ssn,
//               aadhar: aadhar,
//               passport: passport,
//               non_us: nonUS,
//               personal_guarantee: "YES",
//               phone_number: item.mobile,
//               ccc: item.address?.country.callingCode,
//               address: {
//                 country_code: item.address?.countryCode,
//                 state_code: state_code,
//                 city_code: city_code,
//                 zip: zip,
//                 address: address,
//                 address_type: "PERSONAL",
//               },
//               kyc: {
//                 type: item.piiUploadType,
//                 front: item.piiUpload1,
//                 back: item.piiUpload2,
//                 document_name: item.piiUploadName1 ?? "kyc_front",
//                 document_name_back: item.piiUploadName2 ?? "kyc_back",
//               },
//             }),
//           }
//         );
//         if (!gpsCreateOwnerInfo.ok) {
//           throw new TRPCError({
//             code: "INTERNAL_SERVER_ERROR",
//             message: "Submitting Owner-info to GPS Failed",
//           });
//         } else {
//           log.info(
//             `Owner details submitted to GPS and output is ${gpsCreateOwnerInfo}`
//           );
//         }
//       });
//       const submitOtherInfo = await fetch(
//         "https://qaapi1.monay.com/v1/kyc/india/submit",
//         {
//           method: "POST",
//           headers: {
//             Authorization: bearerToken,
//           },
//           body: JSON.stringify({
//             company_type: kybDocument.businessType ?? "PROPRIETORSHIP_COMPANY",
//             registration_certificate: "string",
//             pan_card_company: "string",
//             gst_number: "string",
//             deed: "string",
//             authorization_letter: "string",
//             address_proof_business: "string",
//             address_proof_owner: "string",
//             id_proof_partener_owner_trustee: "string",
//             board_resolution_doc: "string",
//             last_two_year_trust_audit: "string",
//             one_photo: "string",
//             cancelled_cheque: "string",
//             bank_statement: "string",
//             partner_trustee_data: [
//               "string"
//             ],
//             // category_id: "kyc_03",
//             // business_primary_line: kybDocument.primaryBusiness ?? "",
//             // backcard_sales_1yr: kybDocument.firstYearSalesVol ?? "",
//             // average_ticket_size: kybDocument.averageTxAmt ?? "",
//             // order_processing_type: kybDocument.posType ?? "",
//             // order_processing_percentage: kybDocument.posPct ?? "0",
//           }),
//         }
//       );
//       if (!submitOtherInfo.ok) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Submitting Owner-info to GPS Failed",
//         });
//       } else {
//         log.info(
//           `Other details for KYB submitted to GPS and output is ${submitOtherInfo}`
//         );
//       }

//       let bodyData = null;
//       if (kybDocument.localeData?.kybLocaleUs?.isTicker) {
//         bodyData = {
//           is_authorised_cb: kybDocument.localeData.kybLocaleUs.isAuthorisedCb,
//           is_ticker: true,
//           ticker_symbol: kybDocument.localeData.kybLocaleUs.tickerSymbol,
//         };
//       } else {
//         const resumeData: string[] = [];
//         kybDocument.keyManagement.map(async (item) => {
//           //upload docs to gps using file/upload api and
//           if (!item.resumeUrl) {
//             throw new TRPCError({
//               code: "NOT_FOUND",
//               message: "Resume url must exist!!",
//             });
//           }
//           const base64Data = await getImageDataFromUrl(item.resumeUrl);
//           const { id, document_name } = await (
//             await fetch("https://qaapi1.monay.com/v1/kyc/file_upload", {
//               method: "POST",
//               headers: {
//                 authorization: bearerToken,
//               },
//               body: JSON.stringify({
//                 document_name: "resumeOKybManager",
//                 file: base64Data,
//                 document_type: "LIST_OF_KEY_MANAGEMENT",
//                 img_type: "",
//               }),
//             })
//           ).json();
//           // const { id, document_name } = uploadFileTOGPS;
//           resumeData.push(
//             JSON.stringify({
//               bio_id: id ?? "",
//               bio_name: document_name ?? "",
//               name: item.name ?? "",
//               profile_link: item.linkedinUrl ?? "",
//               title: item.title ?? "",
//               uploadedResume: id ?? false,
//             })
//           );
//         });
//         bodyData = {
//           business_legal_name: kybDocument.merchantName ?? "",
//           business_description: kybDocument.primaryBusiness ?? "",
//           //
//           business_type: kybDocument.businessType ?? "",
//           product_sold: kybDocument.productsAndServices ?? "string",
//           //
//           background_info: kybDocument.backgroundInfo,
//           key_management: "",
//           // ticker_symbol: "string", //not required
//           category_id: "", //done -> no input required
//           background_info_id: "string", // document type = "BACK_GROUND_INFO_AND_PRINCIPLES"
//           key_management_id: "string",

//           //kyb docs
//           corporate_overview_investor_management_id: "string", //upload docs and then id here
//           two_year_of_fiscal_year_financial_statement_id: "string", //upload docs and then id here
//           interim_financial_statement_id: "string", //upload docs and then id here
//           copy_of_void_check_id: "string", //upload docs and then id here
//           merchant_processing_statement_id: "string", //upload docs and then id here
//           third_p_and_l_projection_id: "string", //upload docs and then id here

//           //
//           is_authorised_cb:
//             kybDocument.localeData?.kybLocaleUs?.isAuthorisedCb ?? true,
//           is_ticker: false,
//           resumeData: resumeData, //upload the data here from the ListOfKeyMgmt table
//         };
//       }
//       //submitting the Financoial Documentation
//       const submitFinancialDocs = await fetch(
//         "https://qaapi1.monay.com/v1/add_financial_docs",
//         {
//           method: "POST",
//           headers: {
//             Authorization: bearerToken,
//           },
//           body: JSON.stringify({ ...bodyData }),
//         }
//       );
//       if (!submitFinancialDocs.ok) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Submitting Financial Doc to GPS Failed",
//         });
//       } else {
//         log.info(
//           `Financial details for KYB submitted to GPS and output is ${submitFinancialDocs}`
//         );
//       }

//       //bill to address
//       // const { address, country_code, state_code, city_code, zip } =
//       //   businessAddress.jsonAddress as Address;
//       const billToAddress = kybDocument?.address ?? { jsonAddress: {} };
//       const { address, state_code, city_code, zip } =
//         billToAddress.jsonAddress as AddressObject;

//       //submit boarding form
//       const submitBoardingForm = await fetch(
//         "https://qaapi1.monay.com/v1/kyc/boarding",
//         {
//           method: "POST",
//           headers: {
//             Authorization: bearerToken,
//             body: JSON.stringify({
//               boarding_type: "NEW_LOCATION", // it is default right now in GPS
//               location_count: kybDocument.locationCount ?? 0,
//               merchant_type: kybDocument.businessType ?? "", //not present
//               state_inc: kybDocument.incorporationState ?? "", // state in which company is legaly incorporated
//               month_year_incorporated: kybDocument.incorporationDate ?? "",
//               tin_type: kybDocument.taxIdType ?? "", //either SSN/EIN/?
//               irs_filing_name: kybDocument.taxName ?? "", //Company's name registered in Internal Revenue Service (IRS) for the administration of tax laws.

//               //dba details
//               dba_name: kybDocument.dbaContactName ?? "",
//               dba_contact: kybDocument.dbaNumber ?? "",
//               ccc_dba_contact: "string",

//               //this is business address
//               address: {
//                 country_code: "string",
//                 state_code: "string",
//                 city_code: "string",
//                 zip: "string",
//                 address: "string",
//                 address_type: "BUSINESS",
//               },
//               phone_number: "string",
//               ccc: "string",
//               is_landline:
//                 kybDocument.dbaContactType == "MOBILE" ? false : true,
//               retail_descriptor: kybDocument.retailDescriptor ?? "",
//               cust_svc: "string", //phone number of customer
//               ccc_cust_svc: "string", //ccc of customer phone no.

//               //billing details
//               bill_to_name: kybDocument.billToName ?? "",
//               bill_to_contact_name: kybDocument.billToContactName ?? "",
//               bill_to_phone: kybDocument.billToPhone ?? "",
//               ccc_bill_to_phone: "string",
//               is_same_address: false,
//               bill_address: {
//                 state_code: state_code ?? "",
//                 city_code: city_code ?? "",
//                 zip: zip ?? "",
//                 address: address ?? "",
//                 country_code: kybDocument.billToAddress?.countryCode ?? "",
//                 address_type: "BILLING",
//               },

//               //
//               visa_anual_volume: "string",
//               visa_average_ticket: "string",
//               full_anual_volume: "string",
//               full_average_ticket: "string",
//             }),
//           },
//         }
//       );

//       if (!submitBoardingForm.ok) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Submitting Owner-info to GPS Failed",
//         });
//       } else {
//         log.info(
//           `Other details for KYB submitted to GPS and output is ${submitBoardingForm}`
//         );
//       }

//       //submit Billing Info to GPS
//       const submitBillingInfo = await fetch(
//         "https://qaapi1.monay.com/v1/billing/details",
//         {
//           method: "POST",
//           headers: {
//             Authorization: bearerToken,
//           },
//           body: JSON.stringify({
//             fee_model: kybDocument.feeModel,
//             company_identifier: "string",
//             company_name: kybDocument.merchantName,
//             company_fax: "string",
//             company_fax_ccc: "string",
//             company_signature: "string",
//             company_logo: "string",
//             company_sign_file_name: "string",
//             company_logo_file_name: "string",

//             customer_service_email: kybDocument.customerServiceEmail,

//             dba_number: kybDocument.dbaNumber,
//             //url of social medias
//             url_facebook: kybDocument.facebookUrl,
//             url_twitter: kybDocument.twitterUrl,
//             url_instagram: kybDocument.instagramUrl,
//             //bank details
//             bank_routing_number: "string", //IFSC code
//             bank_account_number: "string",
//             account_type: "string",
//             check_type: "string",
//             check_number: "string",

//             //phone details
//             phone_number: "string",
//             ccc: "string",
//           }),
//         }
//       );
//       if (!submitBillingInfo.ok) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Submitting Billing-Info to GPS Failed",
//         });
//       } else {
//         log.info(
//           `Billing-Info details for KYB submitted to GPS and output is ${gpsCreateOwnerInfo}`
//         );
//       }
//     } catch (error) {
//       return error;
//     }
//   });

// // adding very first step of KYC (business info)
// export const addBusinessInformation = authProcedure
//   .input(inputAddBusinessInformation)
//   //   .output()
//   .mutation(async ({ input, ctx: { authEmail, prisma, log } }) => {
//     if (!input.token) {
//       throw new TRPCError({
//         code: "UNAUTHORIZED",
//         message: "JWT Spoof found!",
//       });
//     }
//     const user = await prisma.user.findUnique({
//       where: { email: authEmail },
//     });
//     if (!user) {
//       throw new TRPCError({
//         code: "NOT_FOUND",
//         message: "User not found errir",
//       });
//     }
//     // const dataToCreate = {
//     //   business_legal_name: input.business_legal_name,
//     //   tax_id: input.tax_id,
//     //   dba: input.dba,
//     //   web_url: input.web_url,
//     //   address: input.address,
//     //   city_code: input.city_code,
//     //   state_code: input.state_code,
//     //   country_code: input.country_code,
//     //   zip: input.zip,
//     //   category_id: input.category_id,
//     //   tel_phone: input.tel_phone,
//     //   is_landline: input.is_landline,
//     //   ccc: input.ccc,
//     //   address_type: input.address_type,
//     //   is_primary: input.is_primary,
//     //   is_subAccount: input.is_subAccount || false,
//     // };
//     const dataToCreate = { ...input };
//     delete dataToCreate.token;

//     const dataCreated = await prisma.kYCBusinessInfo.create({
//       data: {
//         ...dataToCreate,
//       },
//     });
//     if (!dataCreated || !dataCreated.id) {
//       throw new TRPCError({
//         code: "INTERNAL_SERVER_ERROR",
//         message: "KYCBusinessInfo not created!!!",
//       });
//     }
//     //now store the id to user table
//     const updatedUser = await prisma.user.update({
//       where: {
//         id: user.id,
//       },
//       data: {
//         kycBusinessInfoId: dataCreated.id,
//       },
//     });
//     log.info(
//       `User ${updatedUser.email ?? "EMAIL"}/${
//         updatedUser.kycBusinessInfoId ?? "kycBusinessInfoId"
//       } added at ${user.updatedAt?.toLocaleString("en-US")}`
//     );
//   });

// // adding second step of KYC (Owners Info, there may be multiple owners)
// export const addOwnershipInformation = authProcedure
//   .input(inputAddContactInformation)
//   //   .output()
//   .mutation(async ({ input, ctx: { prisma, log, authEmail } }) => {
//     const user = await prisma.user.findUnique({
//       where: { email: input.email },
//     });
//     if (!user) {
//       throw new TRPCError({
//         code: "NOT_FOUND",
//         message: "user not found in the db",
//       });
//     }
//     const dataToCreate = {
//       ...input,
//     };
//     delete dataToCreate.token;
//     const ownerInfoCreated = await prisma.kYCOwnerDetails.create({
//       data: {
//         ...dataToCreate,
//       },
//     });
//     log.info(
//       `KYC Contact data for owner ${
//         authEmail ?? "EMAIL"
//       } info created with id ${
//         ownerInfoCreated.id
//       } at ${Date.now().toLocaleString("en-US")}`
//     );
//     return true;
//   });

// // adding other info like all kycs docs etc..
// export const addOtherInfo = authProcedure
//   .input(inputAddotherInformation)
//   //   .output()
//   .mutation(async ({ input, ctx: { prisma, log, authEmail } }) => {
//     const user = await prisma.user.findUnique({
//       where: { email: authEmail },
//     });
//     if (!user) {
//       throw new TRPCError({
//         code: "NOT_FOUND",
//         message: "user not found in the db",
//       });
//     }
//     const dataToCreate = {
//       ...input,
//     };

//     return true;
//   });

// // last step of KYC (adding Billing Details)
// export const addBillingInfo = authProcedure
//   .input(inputBillingInfo)
//   //   .output()
//   .mutation(async ({ input, ctx: { prisma, log, authEmail } }) => {
//     const user = await prisma.user.findUnique({
//       where: { email: authEmail },
//     });
//     if (!user) {
//       throw new TRPCError({
//         code: "NOT_FOUND",
//         message: "user not found in the db",
//       });
//     }
//     const dataToCreate = {
//       ...input,
//     };
//     delete dataToCreate.token;
//     const kycBillingInfoCreated = await prisma.kYCBillingInfo.create({
//       data: {
//         ...dataToCreate,
//       },
//     });
//     log.info(
//       `KYC data for Billing-Details ${
//         authEmail ?? "EMAIL"
//       } info created with Id ${
//         kycBillingInfoCreated.id
//       } at ${Date.now().toLocaleString("en-US")}`
//     );
//     const updatedUser = await prisma.user.update({
//       where: {
//         id: user.id,
//       },
//       data: {
//         kycBillingInfoId: kycBillingInfoCreated.id,
//       },
//     });
//     log.info(
//       `Id of Billing-Details info added in User table with Id ${
//         kycBillingInfoCreated.id
//       } in user ${updatedUser.email} at ${Date.now().toLocaleString("en-US")}`
//     );
//     return true;
//   });
