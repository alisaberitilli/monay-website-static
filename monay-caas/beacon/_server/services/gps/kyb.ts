import { TRPCError } from "@trpc/server";

import config from "#server/config";
// import { array } from "zod";
import { authProcedure } from "#server/trpc";
import { env } from "#server/utils";

import {
  createContactGps, // getFileExtension,
  submitBusinessInfo,
  tickerFinancialDocSubmit,
  uploadDocToGPS,
} from "./helpers";
// import { z } from "zod";
import {
  inputAddBusinessInformation,
  inputAddContactInformation,
  inputAddotherInformation,
  inputBillingInfo,
  inputKyBSubmit,
} from "./validators";

const getImageDataFromUrl = async (url: string): Promise<string> => {
  const imageResponse = await fetch(url);
  const blob = await imageResponse.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (!reader.result) reject(reader.result);
      else resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

// KYB for US
export const kycSubmitToGPSUS = authProcedure
  .input(inputKyBSubmit)
  // .output()
  .mutation(async ({ input, ctx: { authEmail, prisma, log } }) => {
    const bearerToken =
      "Bearer " + input.gpsToken ??
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFydmluZGsrYmVhY29uaW5kM0B0aWxsaS5wcm8iLCJ1c2VyX2lkIjoiOTZmNmIzYjgtMThkYi00MTBjLTgyZTQtOTVmNjRiM2U3ZjgzIiwic3ViX2FjY291bnRfaWQiOiIwOGRhMTIzOC0wMmVjLTRmNjgtODNmYi04MjhiM2RjZWFmN2EiLCJzZXNzaW9uX2lkIjoiOWIwNmI5NzYtMmFkYS00ZmVhLWI2MjQtM2Y4MThlZTIwOWI5IiwiaWF0IjoxNjkwNDU0NTcxLCJleHAiOjE2OTA1MDg1NzF9._TmM6yRz1bL8RmFySZs7gMV7M7E15krbzd3q5Rqqi18";
    const kybDocument = await prisma.kybDocument.findUnique({
      where: {
        id: input.kybDocId,
      },
      include: {
        address: {
          include: {
            country: true,
          },
        },
        owners: {
          include: {
            address: {
              include: {
                country: true,
              },
            },
          },
        },
        localeData: {
          include: {
            kybLocaleUs: true,
          },
        },
        billToAddress: {
          include: {
            country: true,
          },
        },
        keyManagement: true,
      },
    });
    if (!kybDocument) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "no kyb data found, please check kyb doc id",
      });
    }

    const submitBusinessInfoRes = await submitBusinessInfo(
      {
        business_legal_name: kybDocument.merchantName || "",
        tax_id: kybDocument.taxId || "",
        dba: kybDocument.subMerchantDba || "",
        web_url: kybDocument.website || "",
        jsonAddress: kybDocument.address?.jsonAddress,
        country_code: kybDocument.address?.countryCode || "",
        tel_phone: kybDocument?.phone || "",
        is_landline: kybDocument.phoneType == "MOBILE" ? false : true,
        ccc: kybDocument.address?.country.callingCode || "",
        is_primary: false,
        is_subAccount: false,
      },
      bearerToken
    );
    console.log(submitBusinessInfoRes);

    try {
      // const businessAddress = kybDocument?.address ?? { jsonAddress: {} };
      // const { address, country_code, state_code, city_code, zip } =
      //   businessAddress.jsonAddress as AddressObject;
      //   const gpsBusinessinfoCreateResponse = await fetch(
      //     "https://qaapi1.monay.com/v1/kyc/business_info",
      //     {
      //       method: "POST",
      //       headers: {
      //         Authorization: bearerToken,
      //       },
      //       body: JSON.stringify({
      //         business_legal_name: kybDocument.merchantName,
      //         tax_id: kybDocument.taxId,
      //         dba: kybDocument.subMerchantDba,
      //         web_url: kybDocument.website,
      //         //address
      //         address_type: "BUSINESS",
      //         address: address,
      //         country_code: country_code,
      //         state_code: state_code,
      //         city_code: city_code,
      //         zip: zip,

      //         category_id: "kyc_01",
      //         tel_phone: kybDocument?.phone || "",
      //         is_landline: false,
      //         ccc: kybDocument.address?.country.callingCode,
      //         is_primary: true,
      //         is_subAccount: false,
      //       }),
      //     }
      //   );
      //   if (!gpsBusinessinfoCreateResponse.ok) {
      //     throw new TRPCError({
      //       code: "INTERNAL_SERVER_ERROR",
      //       message: "Submitting Business Doc to GPS Failed",
      //     });
      //   }

      //Get KYB owner details
      const kybOwnerDetails = kybDocument.owners;
      if (!kybOwnerDetails.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "KYB Owner details not found!",
        });
      }

      await Promise.all(
        kybOwnerDetails.map(async (item) => {
          //now try to submit the owner info
          if (!item.name) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "name not found for the kyb owner",
            });
          }
          const [firstName, ...last_name] = item.name.split(" ");
          const lastName = last_name.join(" ");
          let aadhar = "";
          let passport = "";
          let ssn = "";
          // const licence = null;
          if (item.piiType == "AADHAR") {
            aadhar = item.pii || "";
          } else if (item.piiType == "PASSPORT") {
            passport = item.pii || "";
          } else {
            ssn = item.pii || "";
          }
          let nonUS = true;
          if (item.address?.countryCode == "+1") {
            nonUS = false;
          }

          const businessAddress = item?.address ?? { jsonAddress: {} };
          const addressObj = businessAddress.jsonAddress as AddressObject;

          if (!item.dob) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "DOB is required for the KYB!!!",
            });
          }
          await createContactGps({
            category_id: "kyc_02",
            count: kybDocument.locationCount || 0,
            title: item.title || "",
            email: item.email || "",
            first_name: firstName,
            last_name: lastName,
            full_name: item.name,
            dob: new Date(item.dob.toString()), //please check here
            percentage_ownership: item.ownershipPct?.toString() || "0.0", //please check here too
            ssn: ssn,
            aadhar: aadhar,
            passport: passport || "",
            non_us: nonUS,
            personal_guarantee: "YES",
            phone_number: item.mobile || "",
            ccc: item.address?.country.callingCode || "",
            address: {
              country_code: item.address?.countryCode || "",
              state_code: addressObj.state_code || "",
              city_code: addressObj.city_code || "",
              zip: addressObj.zip || "",
              address: addressObj.address || "",
              address_type: "PERSONAL",
            },
            kyc: {
              type: item.piiUploadType || "",
              front: item.piiUpload1 || "",
              back: item.piiUpload2 || "",
              document_name: item.piiUploadName1 ?? "kyc_front",
              document_name_back: item.piiUploadName2 ?? "kyc_back",
            },
          });
        })
      );
      //   const gpsCreateOwnerInfo = await fetch(
      //     "https://qaapi1.monay.com/v1/kyc/contact",
      //     {
      //       method: "POST",
      //       headers: {
      //         Authorization: bearerToken,
      //       },
      //       body: JSON.stringify({
      //         category_id: "kyc_02",
      //         count: kybDocument.locationCount,
      //         title: item?.title,
      //         email: item.email,
      //         first_name: firstName,
      //         last_name: lastName,
      //         full_name: item.name,
      //         dob: item.dob,
      //         percentage_ownership: item.ownershipPct,
      //         ssn: ssn,
      //         aadhar: aadhar,
      //         passport: passport,
      //         non_us: nonUS,
      //         personal_guarantee: "YES",
      //         phone_number: item.mobile,
      //         ccc: item.address?.country.callingCode,
      //         address: {
      //           country_code: item.address?.countryCode,
      //           state_code: state_code,
      //           city_code: city_code,
      //           zip: zip,
      //           address: address,
      //           address_type: "PERSONAL",
      //         },
      //         kyc: {
      //           type: item.piiUploadType,
      //           front: item.piiUpload1,
      //           back: item.piiUpload2,
      //           document_name: item.piiUploadName1 ?? "kyc_front",
      //           document_name_back: item.piiUploadName2 ?? "kyc_back",
      //         },
      //       }),
      //     }
      //   );
      //   if (!gpsCreateOwnerInfo.ok) {
      //     throw new TRPCError({
      //       code: "INTERNAL_SERVER_ERROR",
      //       message: "Submitting Owner-info to GPS Failed",
      //     });
      //   } else {
      //     log.info(
      //       `Owner details submitted to GPS and output is ${gpsCreateOwnerInfo}`
      //     );
      //   }
      // });
      const submitOtherInfo = await fetch(
        "https://qaapi1.monay.com/v1/kyc/other_info",
        {
          method: "POST",
          headers: {
            Authorization: bearerToken,
          },
          body: JSON.stringify({
            category_id: "kyc_03",
            business_primary_line: kybDocument.primaryBusiness ?? "",
            backcard_sales_1yr: kybDocument.firstYearSalesVol ?? "",
            average_ticket_size: kybDocument.averageTxAmt ?? "",
            order_processing_type: kybDocument.posType ?? "",
            order_processing_percentage: kybDocument.posPct ?? "0",
          }),
        }
      );
      if (!submitOtherInfo.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Submitting Owner-info to GPS Failed",
        });
      } else {
        log.info(
          `Other details for KYB submitted to GPS and output is ${submitOtherInfo}`
        );
      }
      // const submitOtherInfo = await fetch(
      //   "https://qaapi1.monay.com/v1/kyc/other_info",
      //   {
      //     method: "POST",
      //     headers: {
      //       Authorization: bearerToken,
      //     },
      //     body: JSON.stringify({
      //       category_id: "kyc_03",
      //       business_primary_line: kybDocument.primaryBusiness ?? "",
      //       backcard_sales_1yr: kybDocument.firstYearSalesVol ?? "",
      //       average_ticket_size: kybDocument.averageTxAmt ?? "",
      //       order_processing_type: kybDocument.posType ?? "",
      //       order_processing_percentage: kybDocument.posPct ?? "0",
      //     }),
      //   }
      // );
      // if (!submitOtherInfo.ok) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Submitting Owner-info to GPS Failed",
      //   });
      // } else {
      //   log.info(
      //     `Other details for KYB submitted to GPS and output is ${submitOtherInfo}`
      //   );
      // }

      //submitting the Financial Documentation
      if (kybDocument.localeData?.kybLocaleUs?.isTicker) {
        const bodyData = {
          is_authorised_cb:
            kybDocument.localeData.kybLocaleUs.isAuthorisedCb || true,
          is_ticker: true,
          ticker_symbol: kybDocument.localeData.kybLocaleUs.tickerSymbol || "", //please check here too
        };
        if ("" == bodyData.ticker_symbol || null == bodyData.ticker_symbol) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "ticker symbol is null or empty or undefined!!!",
          });
        }
        await tickerFinancialDocSubmit({
          bearerToken: bearerToken || "",
          ...bodyData,
        });
      } else {
        const resumeData: string[] = [];
        await Promise.all(
          kybDocument.keyManagement.map(async (item) => {
            //upload docs to gps using file/upload api and
            if (item.resumeUrl) {
              const base64Data = await getImageDataFromUrl(item.resumeUrl);
              const { id, document_name } = await uploadDocToGPS({
                country: "US",
                bearerToken: bearerToken,
                base64Data: base64Data,
                document_type: "LIST_OF_KEY_MANAGEMENT",
              });
              resumeData.push(
                JSON.stringify({
                  bio_id: id ?? "",
                  bio_name: document_name ?? "",
                  name: item.name ?? "",
                  title: item.title ?? "",
                  profile_link: item.linkedinUrl ?? "",
                  uploadedResume: id ? true : false,
                })
              );
            }
          })
        );

        const bodyData = {
          category_id: "", //done -> no input required
          business_legal_name: kybDocument.merchantName ?? "",
          is_authorised_cb:
            kybDocument.localeData?.kybLocaleUs?.isAuthorisedCb ?? true,
          is_ticker: false,
          resumeData: resumeData, //upload the data here from the ListOfKeyMgmt table

          business_description: kybDocument.primaryBusiness ?? "",
          business_type: kybDocument.businessType ?? "",
          product_sold: kybDocument.productsAndServices ?? "",
          key_management: "",
          key_management_id: "",
          background_info: kybDocument.backgroundInfo,
          background_info_id: "", // document type = "BACK_GROUND_INFO_AND_PRINCIPLES"

          //kyb docs
          corporate_overview_investor_management_id: "", //upload docs and then id here
          two_year_of_fiscal_year_financial_statement_id: "", //upload docs and then id here
          interim_financial_statement_id: "", //upload docs and then id here
          copy_of_void_check_id: "", //upload docs and then id here
          merchant_processing_statement_id: "", //upload docs and then id here
          third_p_and_l_projection_id: "", //upload docs and then id here
        };
        //upload corporate overview doc
        if (kybDocument.corpOverviewUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.corpOverviewUrl
          );
          const { id } = await uploadDocToGPS({
            country: "US",
            bearerToken: bearerToken,
            base64Data: base64Data as string,
            document_type: "CORPORATE_OVERVIEW_INVESTOR_MANAGEMENT",
          });
          bodyData.corporate_overview_investor_management_id = id;
        }
        //upload two year financial doc
        if (kybDocument.statementUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.statementUrl
          );
          const { id } = await uploadDocToGPS({
            country: "US",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "CORPORATE_OVERVIEW_INVESTOR_MANAGEMENT",
          });
          bodyData.two_year_of_fiscal_year_financial_statement_id = id;
        }
        //upload two year financial doc
        if (kybDocument.statementInterimUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.statementInterimUrl
          );
          const { id } = await uploadDocToGPS({
            country: "US",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "INTERIM_FINANCIAL_STATEMENT",
          });
          bodyData.interim_financial_statement_id = id;
        }
        //upload copy of void check doc
        if (kybDocument.depositoryInfoUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.depositoryInfoUrl
          );
          const { id } = await uploadDocToGPS({
            country: "US",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "COPY_OF_VOIDED_CHECK_AND_BANK_STATEMENT",
          });
          bodyData.copy_of_void_check_id = id;
        }
        //upload merchant processing stmt doc
        if (kybDocument.merchProcessingUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.merchProcessingUrl
          );
          const { id } = await uploadDocToGPS({
            country: "US",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "MERCHANT_PROCESSING_STATEMENT",
          });
          bodyData.merchant_processing_statement_id = id;
        }
        //upload third p_and_l doc
        if (kybDocument.profitLossUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.profitLossUrl
          );
          const { id } = await uploadDocToGPS({
            country: "US",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type:
              "_3YEAR_P_AND_L_PROJECTION_IF_SUB_MERCHANT_IS_STARTUP",
          });
          bodyData.third_p_and_l_projection_id = id;
        }
        //upload back_ground info doc if exists
        if (kybDocument.backgroundInfoUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.backgroundInfoUrl
          );
          const { id } = await uploadDocToGPS({
            country: "US",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "BACK_GROUND_INFO_AND_PRINCIPLES",
          });
          bodyData.background_info_id = id;
        }

        const submitFinancialDocs = await fetch(
          `${config.gpsApiPath}/kyc/financial_docs`,
          {
            method: "POST",
            headers: {
              Authorization: bearerToken,
            },
            body: JSON.stringify({ ...bodyData }),
          }
        );
        const financialResponse = await submitFinancialDocs.json();
        if (financialResponse.hasError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Submitting Financial Doc to GPS Failed",
          });
        } else {
          log.info(
            `Financial details for KYB submitted to GPS and output is ${submitFinancialDocs}`
          );
        }
      }

      //bill to address
      // const { address, country_code, state_code, city_code, zip } =
      //   businessAddress.jsonAddress as Address;
      // const billToAddress = kybDocument?.address ?? { jsonAddress: {} };
      // const { address, state_code, city_code, zip } =
      //   billToAddress.jsonAddress as AddressObject;

      const businessAddress = kybDocument?.address ?? { jsonAddress: {} };
      const addressObj = businessAddress.jsonAddress as AddressObject;

      const billAddress = kybDocument?.billToAddress ?? { jsonAddress: {} };
      const billAddressObj = billAddress.jsonAddress as AddressObject;
      //submit boarding form
      const submitBoardingForm = await fetch(
        "https://qaapi1.monay.com/v1/kyc/boarding",
        {
          method: "POST",
          headers: {
            Authorization: bearerToken,
            body: JSON.stringify({
              boarding_type: "NEW_LOCATION", // it is default right now in GPS
              location_count: kybDocument.locationCount ?? 0,
              merchant_type: kybDocument.businessType ?? "", //not present
              state_inc: kybDocument.incorporationState ?? "", // state in which company is legaly incorporated
              month_year_incorporated: kybDocument.incorporationDate ?? "",
              tin_type: kybDocument.taxIdType ?? "", //either SSN/EIN/?
              irs_filing_name: kybDocument.taxName ?? "", //Company's name registered in Internal Revenue Service (IRS) for the administration of tax laws.

              //dba details
              dba_name: kybDocument.dbaContactName ?? "",
              dba_contact: kybDocument.dbaNumber ?? "",
              ccc_dba_contact: "string",

              //this is business address
              address: {
                country_code: addressObj.country_code || "",
                state_code: addressObj.state_code || "",
                city_code: addressObj.city_code || "",
                zip: addressObj.zip || "",
                address: addressObj.address || "",
                address_type: "BUSINESS",
              },
              phone_number: kybDocument.dbaNumber || "",
              ccc: kybDocument.billToAddress?.country.callingCode || "",
              is_landline:
                kybDocument.dbaContactType == "MOBILE" ? false : true,
              retail_descriptor: kybDocument.retailDescriptor ?? "",
              cust_svc: kybDocument.customerServiceNum || "", //phone number of customer
              ccc_cust_svc:
                kybDocument.billToAddress?.country.callingCode || "", //ccc of customer phone no.

              //billing details
              bill_to_name: kybDocument.billToName ?? "",
              bill_to_contact_name: kybDocument.billToContactName ?? "",
              bill_to_phone: kybDocument.billToPhone ?? "",
              ccc_bill_to_phone:
                kybDocument.billToAddress?.country.callingCode || "",
              is_same_address: false,
              bill_address: {
                country_code: billAddressObj.country_code ?? "",
                state_code: billAddressObj.state_code ?? "",
                city_code: billAddressObj.city_code ?? "",
                zip: billAddressObj.zip ?? "",
                address: billAddressObj.address ?? "",
                address_type: "BILLING",
              },

              //
              visa_anual_volume:
                kybDocument.firstYearSalesVol?.toString() || "",
              visa_average_ticket: kybDocument.averageTxAmt?.toString() || "",
              full_anual_volume:
                kybDocument.firstYearSalesVol?.toString() || "",
              full_average_ticket: kybDocument.averageTxAmt?.toString() || "",
            }),
          },
        }
      );

      if (!submitBoardingForm.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Submitting Owner-info to GPS Failed",
        });
      } else {
        log.info(
          `Other details for KYB submitted to GPS and output is ${submitBoardingForm}`
        );
      }

      //submit Billing Info to GPS
      const submitBillingInfo = await fetch(
        "https://qaapi1.monay.com/v1/billing/details",
        {
          method: "POST",
          headers: {
            Authorization: bearerToken,
          },
          body: JSON.stringify({
            fee_model: kybDocument.feeModel,
            company_identifier: kybDocument.subMerchantDba || "", //please check here
            company_name: kybDocument.merchantName,

            company_fax: kybDocument.companyFax || "",
            company_fax_ccc: kybDocument.companyFaxCCC || "",

            company_signature: "string",
            company_logo: "string",
            company_sign_file_name: "string",
            company_logo_file_name: "string",

            customer_service_email: kybDocument.customerServiceEmail,

            dba_number: kybDocument.dbaNumber || "",
            //url of social medias
            url_facebook: kybDocument.facebookUrl,
            url_twitter: kybDocument.twitterUrl,
            url_instagram: kybDocument.instagramUrl,
            //bank details
            bank_routing_number: kybDocument.bankRoutingNum || "", //IFSC code
            bank_account_number: kybDocument.bankAccNum || "",
            account_type: kybDocument.bankAccType || "",
            check_type: kybDocument.checkType || "",
            check_number: kybDocument.checkNum || "",

            //phone details
            phone_number: kybDocument.billToPhone || "",
            ccc: kybDocument.billToAddress?.country.callingCode || "",
          }),
        }
      );
      if (!submitBillingInfo.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Submitting Billing-Info to GPS Failed",
        });
      } else {
        log.info(
          `Billing-Info details for KYB submitted to GPS and output is ${submitBillingInfo}`
        );
      }
    } catch (error) {
      return error;
    }
  });

// KYB for India
export const kycSubmitToGPSInd = authProcedure
  .input(inputKyBSubmit)
  // .output()
  .mutation(async ({ input, ctx: { prisma, log } }) => {
    const bearerToken =
      "Bearer " + input.gpsToken ??
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFydmluZGsrYmVhY29uaW5kM0B0aWxsaS5wcm8iLCJ1c2VyX2lkIjoiOTZmNmIzYjgtMThkYi00MTBjLTgyZTQtOTVmNjRiM2U3ZjgzIiwic3ViX2FjY291bnRfaWQiOiIwOGRhMTIzOC0wMmVjLTRmNjgtODNmYi04MjhiM2RjZWFmN2EiLCJzZXNzaW9uX2lkIjoiOWIwNmI5NzYtMmFkYS00ZmVhLWI2MjQtM2Y4MThlZTIwOWI5IiwiaWF0IjoxNjkwNDU0NTcxLCJleHAiOjE2OTA1MDg1NzF9._TmM6yRz1bL8RmFySZs7gMV7M7E15krbzd3q5Rqqi18";
    const kybDocument = await prisma.kybDocument.findUnique({
      where: {
        id: input.kybDocId,
      },
      include: {
        address: {
          include: {
            country: true,
          },
        },
        owners: {
          include: {
            address: {
              include: {
                country: true,
              },
            },
          },
        },
        localeData: {
          include: {
            kybLocaleIndia: true,
            kybLocaleUs: true,
          },
        },
        billToAddress: {
          include: {
            country: true,
          },
        },
        keyManagement: true,
      },
    });
    if (!kybDocument) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "no kyb data found, please check kyb doc id",
      });
    }

    try {
      //   const businessAddress = kybDocument?.address ?? { jsonAddress: {} };
      //   const { address, country_code, state_code, city_code, zip } =
      //     businessAddress.jsonAddress as AddressObject;
      //   const gpsBusinessinfoCreateResponse = await fetch(
      //     "https://qaapi1.monay.com/v1/kyc/business_info",
      //     {
      //       method: "POST",
      //       headers: {
      //         Authorization: bearerToken,
      //       },
      //       body: JSON.stringify({
      //         business_legal_name: kybDocument.merchantName,
      //         tax_id: kybDocument.taxId,
      //         dba: kybDocument.subMerchantDba,
      //         web_url: kybDocument.website,
      //         //address
      //         address_type: "BUSINESS",
      //         address: address,
      //         country_code: country_code,
      //         state_code: state_code,
      //         city_code: city_code,
      //         zip: zip,

      //         category_id: "kyc_01",
      //         tel_phone: kybDocument?.phone || "",
      //         is_landline: false,
      //         ccc: kybDocument.address?.country.callingCode,
      //         is_primary: true,
      //         is_subAccount: false,
      //       }),
      //     }
      //   );
      //   if (!gpsBusinessinfoCreateResponse.ok) {
      //     throw new TRPCError({
      //       code: "INTERNAL_SERVER_ERROR",
      //       message: "Submitting Business Doc to GPS Failed",
      //     });
      //   }
      const submitBusinessInfoRes = await submitBusinessInfo(
        {
          business_legal_name: kybDocument.merchantName || "",
          tax_id: kybDocument.taxId || "",
          dba: kybDocument.subMerchantDba || "",
          web_url: kybDocument.website || "",
          jsonAddress: kybDocument.address?.jsonAddress,
          country_code: kybDocument.address?.countryCode || "",
          tel_phone: kybDocument?.phone || "",
          is_landline: kybDocument.phoneType == "MOBILE" ? false : true,
          ccc: kybDocument.address?.country.callingCode || "",
          is_primary: false,
          is_subAccount: false,
        },
        bearerToken
      );
      console.log(submitBusinessInfoRes);

      //Get KYB owner details
      const kybOwnerDetails = kybDocument.owners;
      if (!kybOwnerDetails.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "KYB Owner details not found!",
        });
      }

      kybOwnerDetails.map(async (item) => {
        //now try to submit the owner info
        if (!item.name) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "name not found for the kyb owner",
          });
        }
        const [firstName, ...last_name] = item.name.split(" ");
        const lastName = last_name.join(" ");
        let aadhar = null;
        let passport = null;
        let ssn = null;
        // const licence = null;
        if (item.piiType == "AADHAR") {
          aadhar = item.pii || "";
        } else if (item.piiType == "PASSPORT") {
          passport = item.pii || "";
        } else {
          ssn = item.pii;
        }
        let nonUS = true;
        if (item.address?.countryCode == "+1") {
          nonUS = false;
        }
        // const { address, state_code, city_code, zip } = JSON.parse(
        //   item?.address?.jsonAddress
        // );
        const businessAddress = item?.address ?? { jsonAddress: {} };
        const { address, state_code, city_code, zip } =
          businessAddress.jsonAddress as AddressObject;
        const gpsCreateOwnerInfo = await fetch(
          "https://qaapi1.monay.com/v1/kyc/contact",
          {
            method: "POST",
            headers: {
              Authorization: bearerToken,
            },
            body: JSON.stringify({
              category_id: "kyc_02",
              count: kybDocument.locationCount,
              title: item?.title,
              email: item.email,
              first_name: firstName,
              last_name: lastName,
              full_name: item.name,
              dob: item.dob,
              percentage_ownership: item.ownershipPct,
              ssn: ssn,
              aadhar: aadhar,
              passport: passport,
              non_us: nonUS,
              personal_guarantee: "YES",
              phone_number: item.mobile,
              ccc: item.address?.country.callingCode,
              address: {
                country_code: item.address?.countryCode,
                state_code: state_code,
                city_code: city_code,
                zip: zip,
                address: address,
                address_type: "PERSONAL",
              },
              kyc: {
                type: item.piiUploadType,
                front: item.piiUpload1,
                back: item.piiUpload2,
                document_name: item.piiUploadName1 ?? "kyc_front",
                document_name_back: item.piiUploadName2 ?? "kyc_back",
              },
            }),
          }
        );
        if (!gpsCreateOwnerInfo.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Submitting Owner-info to GPS Failed",
          });
        } else {
          log.info(
            `Owner details submitted to GPS and output is ${gpsCreateOwnerInfo}`
          );
        }
      });
      const submitOtherInfo = await fetch(
        "https://qaapi1.monay.com/v1/kyc/india/submit",
        {
          method: "POST",
          headers: {
            Authorization: bearerToken,
          },
          body: JSON.stringify({
            company_type: kybDocument.businessType ?? "PROPRIETORSHIP_COMPANY",
            gst_number: kybDocument.taxId || "",
            registration_certificate: "string",
            pan_card_company: "string",
            deed: "string",
            authorization_letter: "string",
            address_proof_business: "string",
            address_proof_owner: "string",
            id_proof_partener_owner_trustee: "string",
            board_resolution_doc: "string",
            last_two_year_trust_audit: "string",
            one_photo: "string",
            cancelled_cheque: "string",
            bank_statement: "string",
            partner_trustee_data: ["string"],
            // category_id: "kyc_03",
            // business_primary_line: kybDocument.primaryBusiness ?? "",
            // backcard_sales_1yr: kybDocument.firstYearSalesVol ?? "",
            // average_ticket_size: kybDocument.averageTxAmt ?? "",
            // order_processing_type: kybDocument.posType ?? "",
            // order_processing_percentage: kybDocument.posPct ?? "0",
          }),
        }
      );
      if (!submitOtherInfo.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Submitting Owner-info to GPS Failed",
        });
      } else {
        log.info(
          `Other details for KYB submitted to GPS and output is ${submitOtherInfo}`
        );
      }

      let bodyData = null;
      if (kybDocument.localeData?.kybLocaleUs?.isTicker) {
        bodyData = {
          is_authorised_cb: kybDocument.localeData.kybLocaleUs.isAuthorisedCb,
          is_ticker: true,
          ticker_symbol: kybDocument.localeData.kybLocaleUs.tickerSymbol,
        };
      } else {
        const resumeData: string[] = [];
        kybDocument.keyManagement.map(async (item) => {
          //upload docs to gps using file/upload api and
          if (item.resumeUrl) {
            const base64Data = await getImageDataFromUrl(item.resumeUrl);
            const { id, document_name } = await uploadDocToGPS({
              country: "IND",
              bearerToken: bearerToken,
              base64Data: base64Data,
              document_type: "LIST_OF_KEY_MANAGEMENT",
            });
            resumeData.push(
              JSON.stringify({
                bio_id: id ?? "",
                bio_name: document_name ?? "",
                name: item.name ?? "",
                title: item.title ?? "",
                profile_link: item.linkedinUrl ?? "",
                uploadedResume: id ? true : false,
              })
            );
          }
        });

        bodyData = {
          category_id: "", //done -> no input required
          business_legal_name: kybDocument.merchantName ?? "",
          business_description: kybDocument.primaryBusiness ?? "",
          business_type: kybDocument.businessType ?? "",
          product_sold: kybDocument.productsAndServices ?? "",
          //
          key_management: "",
          ticker_symbol: "", //not required

          background_info: kybDocument.backgroundInfo,
          background_info_id: "", // document type = "BACK_GROUND_INFO_AND_PRINCIPLES"
          key_management_id: "",

          //kyb docs
          corporate_overview_investor_management_id: "", //upload docs and then id here
          two_year_of_fiscal_year_financial_statement_id: "", //upload docs and then id here
          interim_financial_statement_id: "", //upload docs and then id here
          copy_of_void_check_id: "", //upload docs and then id here
          merchant_processing_statement_id: "", //upload docs and then id here
          third_p_and_l_projection_id: "", //upload docs and then id here

          is_authorised_cb:
            kybDocument.localeData?.kybLocaleUs?.isAuthorisedCb ?? true,
          is_ticker: false,
          resumeData: resumeData, //upload the data here from the ListOfKeyMgmt table
        };
        //upload corporate overview doc
        if (kybDocument.corpOverviewUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.corpOverviewUrl
          );
          const { id } = await uploadDocToGPS({
            country: "IND",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "CORPORATE_OVERVIEW_INVESTOR_MANAGEMENT",
          });
          bodyData.corporate_overview_investor_management_id = id;
        }
        //upload two year financial doc
        if (kybDocument.statementUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.statementUrl
          );
          const { id } = await uploadDocToGPS({
            country: "IND",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "CORPORATE_OVERVIEW_INVESTOR_MANAGEMENT",
          });
          bodyData.two_year_of_fiscal_year_financial_statement_id = id;
        }
        //upload two year financial doc
        if (kybDocument.statementInterimUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.statementInterimUrl
          );
          const { id } = await uploadDocToGPS({
            country: "IND",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "INTERIM_FINANCIAL_STATEMENT",
          });
          bodyData.interim_financial_statement_id = id;
        }
        //upload copy of void check doc
        if (kybDocument.depositoryInfoUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.depositoryInfoUrl
          );
          const { id } = await uploadDocToGPS({
            country: "IND",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "COPY_OF_VOIDED_CHECK_AND_BANK_STATEMENT",
          });
          bodyData.copy_of_void_check_id = id;
        }
        //upload merchant processing stmt doc
        if (kybDocument.merchProcessingUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.merchProcessingUrl
          );
          const { id } = await uploadDocToGPS({
            country: "IND",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "MERCHANT_PROCESSING_STATEMENT",
          });
          bodyData.merchant_processing_statement_id = id;
        }
        //upload third p_and_l doc
        if (kybDocument.profitLossUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.profitLossUrl
          );
          const { id } = await uploadDocToGPS({
            country: "IND",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type:
              "_3YEAR_P_AND_L_PROJECTION_IF_SUB_MERCHANT_IS_STARTUP",
          });
          bodyData.third_p_and_l_projection_id = id;
        }
        //upload back_ground info doc if exists
        if (kybDocument.backgroundInfoUrl) {
          const base64Data = await getImageDataFromUrl(
            kybDocument.backgroundInfoUrl
          );
          const { id } = await uploadDocToGPS({
            country: "IND",
            bearerToken: bearerToken,
            base64Data: base64Data,
            document_type: "BACK_GROUND_INFO_AND_PRINCIPLES",
          });
          bodyData.background_info_id = id;
        }
      }
      //submitting the Financoial Documentation
      const submitFinancialDocs = await fetch(
        "https://qaapi1.monay.com/v1/add_financial_docs",
        {
          method: "POST",
          headers: {
            Authorization: bearerToken,
          },
          body: JSON.stringify({ ...bodyData }),
        }
      );
      if (!submitFinancialDocs.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Submitting Financial Doc to GPS Failed",
        });
      } else {
        log.info(
          `Financial details for KYB submitted to GPS and output is ${submitFinancialDocs}`
        );
      }

      //bill to address
      const businessAddress = kybDocument?.address ?? { jsonAddress: {} };
      const businessAddObj = businessAddress.jsonAddress as AddressObject;

      const billAddress = kybDocument?.billToAddress ?? { jsonAddress: {} };
      const billAddressObj = billAddress.jsonAddress as AddressObject;

      //submit boarding form
      const submitBoardingForm = await fetch(
        "https://qaapi1.monay.com/v1/kyc/boarding",
        {
          method: "POST",
          headers: {
            Authorization: bearerToken,
            body: JSON.stringify({
              boarding_type: "NEW_LOCATION", // it is default right now in GPS
              location_count: kybDocument.locationCount ?? 0,
              merchant_type: kybDocument.businessType ?? "", //not present
              state_inc: kybDocument.incorporationState ?? "", // state in which company is legaly incorporated
              month_year_incorporated: kybDocument.incorporationDate ?? "",
              tin_type: kybDocument.taxIdType ?? "", //either SSN/EIN/?
              irs_filing_name: kybDocument.taxName ?? "", //Company's name registered in Internal Revenue Service (IRS) for the administration of tax laws.

              //dba details
              dba_name: kybDocument.dbaContactName ?? "",
              dba_contact: kybDocument.dbaNumber ?? "",
              ccc_dba_contact: "string",

              //this is business address
              address: {
                country_code: businessAddObj.country_code || "",
                state_code: businessAddObj.state_code || "",
                city_code: businessAddObj.city_code || "",
                zip: businessAddObj.zip || "",
                address: businessAddObj.address || "",
                address_type: "BUSINESS",
              },
              phone_number: "",
              ccc: "string",
              is_landline:
                kybDocument.dbaContactType == "MOBILE" ? false : true,
              retail_descriptor: kybDocument.retailDescriptor ?? "",
              cust_svc: "string", //phone number of customer
              ccc_cust_svc: "string", //ccc of customer phone no.

              //billing details
              bill_to_name: kybDocument.billToName ?? "",
              bill_to_contact_name: kybDocument.billToContactName ?? "",
              bill_to_phone: kybDocument.billToPhone ?? "",
              ccc_bill_to_phone:
                kybDocument.billToAddress?.country.callingCode || "",
              is_same_address: false,
              bill_address: {
                country_code: kybDocument.billToAddress?.countryCode ?? "",
                state_code: billAddressObj.state_code ?? "",
                city_code: billAddressObj.city_code ?? "",
                zip: billAddressObj.zip ?? "",
                address: billAddressObj.address ?? "",
                address_type: "BILLING",
              },

              // ticket size and avg ticket size
              visa_anual_volume:
                kybDocument.firstYearSalesVol?.toString() || "",
              visa_average_ticket: kybDocument.averageTxAmt?.toString() || "",
              full_anual_volume:
                kybDocument.firstYearSalesVol?.toString() || "",
              full_average_ticket: kybDocument.averageTxAmt?.toString() || "",
            }),
          },
        }
      );

      if (!submitBoardingForm.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Submitting Owner-info to GPS Failed",
        });
      } else {
        log.info(
          `Other details for KYB submitted to GPS and output is ${submitBoardingForm}`
        );
      }

      //submit Billing Info to GPS
      const submitBillingInfo = await fetch(
        "https://qaapi1.monay.com/v1/billing/details",
        {
          method: "POST",
          headers: {
            Authorization: bearerToken,
          },
          body: JSON.stringify({
            fee_model: kybDocument.feeModel,
            company_name: kybDocument.merchantName,
            company_identifier: kybDocument.subMerchantDba || "",
            company_fax: kybDocument.companyFax || "",
            company_fax_ccc: kybDocument.companyFaxCCC || "",

            company_signature: "string",
            company_logo: "string",
            company_sign_file_name: "string",
            company_logo_file_name: "string",

            customer_service_email: kybDocument.customerServiceEmail,

            dba_number: kybDocument.dbaNumber,
            //url of social medias
            url_facebook: kybDocument.facebookUrl,
            url_twitter: kybDocument.twitterUrl,
            url_instagram: kybDocument.instagramUrl,
            //bank details
            bank_routing_number: kybDocument.bankRoutingNum || "", //IFSC code
            bank_account_number: kybDocument.bankAccNum || "",
            account_type: kybDocument.bankAccType || "",
            check_type: kybDocument.checkType || "",
            check_number: kybDocument.checkNum || "",

            //phone details
            phone_number: kybDocument.billToPhone || "",
            ccc: kybDocument.billToAddress?.country.callingCode || "",
          }),
        }
      );
      if (!submitBillingInfo.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Submitting Billing-Info to GPS Failed",
        });
      } else {
        log.info(
          `Billing-Info details for KYB submitted to GPS and output is ${submitBillingInfo}`
        );
      }
    } catch (error) {
      return error;
    }
  });

// adding very first step of KYC (business info)
export const addBusinessInformation = authProcedure
  .input(inputAddBusinessInformation)
  //   .output()
  .mutation(async ({ input, ctx: { authEmail, prisma, log } }) => {
    if (!input.token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "JWT Spoof found!",
      });
    }
    const user = await prisma.user.findUnique({
      where: { email: authEmail },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found errir",
      });
    }
    const dataToCreate = { ...input };
    delete dataToCreate.token;

    const dataCreated = await prisma.kYCBusinessInfo.create({
      data: {
        ...dataToCreate,
      },
    });
    if (!dataCreated || !dataCreated.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "KYCBusinessInfo not created!!!",
      });
    }
    //now store the id to user table
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        kycBusinessInfoId: dataCreated.id,
      },
    });
    log.info(
      `User ${updatedUser.email ?? "EMAIL"}/${
        updatedUser.kycBusinessInfoId ?? "kycBusinessInfoId"
      } added at ${user.updatedAt?.toLocaleString("en-US")}`
    );
  });

// adding second step of KYC (Owners Info, there may be multiple owners)
export const addOwnershipInformation = authProcedure
  .input(inputAddContactInformation)
  //   .output()
  .mutation(async ({ input, ctx: { prisma, log, authEmail } }) => {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "user not found in the db",
      });
    }
    const dataToCreate = {
      ...input,
    };
    delete dataToCreate.token;
    const ownerInfoCreated = await prisma.kybOwner.create({
      data: {
        ...dataToCreate,
      },
    });
    log.info(
      `KYC Contact data for owner ${
        authEmail ?? "EMAIL"
      } info created with id ${
        ownerInfoCreated.id
      } at ${Date.now().toLocaleString("en-US")}`
    );
    return true;
  });

// adding other info like all kycs docs etc..
export const addOtherInfo = authProcedure
  .input(inputAddotherInformation)
  //   .output()
  .mutation(async ({ input, ctx: { prisma, log, authEmail } }) => {
    const user = await prisma.user.findUnique({
      where: { email: authEmail },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "user not found in the db",
      });
    }
    const dataToCreate = {
      ...input,
    };

    return true;
  });

// last step of KYC (adding Billing Details)
export const addBillingInfo = authProcedure
  .input(inputBillingInfo)
  //   .output()
  .mutation(async ({ input, ctx: { prisma, log, authEmail } }) => {
    const user = await prisma.user.findUnique({
      where: { email: authEmail },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "user not found in the db",
      });
    }
    const dataToCreate = {
      ...input,
    };
    delete dataToCreate.token;
    const kycBillingInfoCreated = await prisma.kYCBillingInfo.create({
      data: {
        ...dataToCreate,
      },
    });
    log.info(
      `KYC data for Billing-Details ${
        authEmail ?? "EMAIL"
      } info created with Id ${
        kycBillingInfoCreated.id
      } at ${Date.now().toLocaleString("en-US")}`
    );
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        kycBillingInfoId: kycBillingInfoCreated.id,
      },
    });
    log.info(
      `Id of Billing-Details info added in User table with Id ${
        kycBillingInfoCreated.id
      } in user ${updatedUser.email} at ${Date.now().toLocaleString("en-US")}`
    );
    return true;
  });
