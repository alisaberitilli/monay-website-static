import { TRPCError } from "@trpc/server";
import { JSONValue } from "superjson/dist/types";

import config from "#server/config";
import { env } from "#server/utils";

interface Address {
  address?: string;
  country_code?: string;
  state_code?: string;
  city_code?: string;
  zip?: string;
}
// interface BusinessInformation {
//   address: JSONValue;
//   business_legal_name: string;
//   tax_id: string;
//   dba: string;
//   web_url: string;

//   country_code: string;
//   tel_phone: string;
//   is_landline: boolean;
//   ccc: string;
//   is_primary: boolean;
//   is_subAccount: boolean;
// }

export const submitBusinessInfo = async (
  kybDocument: {
    jsonAddress: JSONValue;
    business_legal_name: string;
    tax_id: string;
    dba: string;
    web_url: string;
    country_code: string;
    tel_phone: string;
    is_landline: boolean;
    ccc: string;
    is_primary: boolean;
    is_subAccount: boolean;
  },
  bearerToken: string
) => {
  const { address, state_code, city_code, zip } =
    kybDocument.jsonAddress as Address;
  const businessInfoResponse = await fetch(
    `${config.gpsApiPath}"/kyc/business_info"`,
    {
      method: "POST",
      headers: {
        Authorization: bearerToken,
      },
      body: JSON.stringify({
        business_legal_name: kybDocument.business_legal_name,
        tax_id: kybDocument.tax_id,
        dba: kybDocument.dba,
        web_url: kybDocument.web_url,
        //address
        address_type: "BUSINESS",
        address: address,
        country_code: kybDocument.country_code,
        state_code: state_code,
        city_code: city_code,
        zip: zip,

        category_id: "kyc_01",
        tel_phone: kybDocument?.tel_phone,
        is_landline: false,
        ccc: kybDocument.ccc,
        is_primary: true,
        is_subAccount: false,
      }),
    }
  );
  const response = await businessInfoResponse.json();
  if (response.hasError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Submitting Business Doc to GPS Failed, message: ${response.message}`,
    });
  }
  return true;
};

interface contactInput {
  bearerToken?: string;
  category_id: string;
  count: number;
  title: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  dob: Date;
  percentage_ownership: string;
  ssn: string;
  aadhar: string;
  passport: string;
  non_us: boolean;
  personal_guarantee: string;
  phone_number: string;
  ccc: string;
  address: {
    country_code: string;
    state_code: string;
    city_code: string;
    address: string;
    zip: string;
    address_type: string;
  };
  kyc: {
    type: string;
    front: string;
    back: string;
    document_name: string;
    document_name_back: string;
  };
}

//functiom to create contact in GPS
export const createContactGps = async (input: contactInput) => {
  const token = input.bearerToken;
  if (!token) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "bearer token is not present to create contact",
    });
  }
  delete input.bearerToken;

  // TODO: fix this path
  const gpsCreateOwnerInfo = await fetch(`${config.gpsApiPath}/kyc/contact`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      ...input,
    }),
  });
  const response = await gpsCreateOwnerInfo.json();
  if (response.hasError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to create contact in GPS, mesage: ${response.message}`,
    });
  }
  return true;
};

interface TickerFinancialInput {
  is_ticker: boolean;
  is_authorised_cb: boolean;
  ticker_symbol: string;
  bearerToken: string;
}

export const tickerFinancialDocSubmit = async (input: TickerFinancialInput) => {
  const response = await fetch(`${config.gpsApiPath}/kyc/financial_docs`, {
    method: "POST",
    headers: {
      Authorization: input.bearerToken,
    },
    body: JSON.stringify({
      ...input,
    }),
  });
  const responseObj = await response.json();
  if (responseObj.hasError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to submit financial docs, message: ${responseObj.message}`,
    });
  }
  return true;
};

interface NonTickerFinancialDoc {
  is_ticker: boolean;
  is_authorised_cb: boolean;
  bearerToken: string;
}
export const nonTickerFinancialDocSubmit = async (
  input: NonTickerFinancialDoc
) => {
  // TODO: verify this path
  const response = await fetch(`${config.gpsApiPath}/kyc/financial_docs`, {
    method: "POST",
    headers: {
      Authorization: input.bearerToken,
    },
    body: JSON.stringify({
      ...input,
    }),
  });
  const responseObj = await response.json();
  if (responseObj.hasError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to submit financial docs, message: ${responseObj.message}`,
    });
  }
  return true;
};

export const getFileExtension = (data: string) => {
  try {
    if (!data || data.length == 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "",
      });
    }
    return data.match(/[^:/]\w+(?=;|,)/)?.[0] || "";
  } catch (error) {
    throw new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message: `Error in getting file extention, message: ${JSON.stringify(
        error
      )}`,
    });
  }
};

export const uploadDocToGPS = async ({
  bearerToken,
  base64Data,
  /* document_name, */
  document_type,
  country,
}: {
  country: string;
  bearerToken: string;
  base64Data: string;
  // document_name: string;
  document_type: string;
}) => {
  let apiPath = null;
  if (country == "US") {
    // TODO: correct these paths
    apiPath = `${config.gpsApiPath}/kyc/us_upload`;
  } else {
    apiPath = `${config.gpsApiPath}/kyc/ind_upload`;
  }
  const { id, document_name } = await (
    await fetch(apiPath, {
      method: "POST",
      headers: {
        authorization: bearerToken,
      },
      body: JSON.stringify({
        // document_name: document_name || "resumeOfKybManager",
        file: base64Data,
        document_type: document_type,
        img_type: getFileExtension(base64Data),
      }),
    })
  ).json();
  return { id, document_name };
};
