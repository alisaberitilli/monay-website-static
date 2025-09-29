import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import path from "path";
import dotenv from "dotenv";

dotenv.config();
export default {
  app: {
    siteName: "Monay",
    siteEmail: "",
    mediaStorage: process.env.MEDIA_STORAGE, //local,s3
    mediaUploadSizeLimit: 1024 * 1024 * 15,
    baseUrl: process.env.BASE_URL,
    adminUrl: process.env.ADMIN_URL,
    environment: process.env.NODE_ENV,
    swaggerHost: process.env.SWAGGER_HOST,
    cryptrSecretKey: process.env.CRYPTR_SECRET,
    languages: ["en"],
    setBaseUrl(url) {
      this.baseUrl = url;
    },
  },
  crypto: {
    algorithm: process.env.CRYPTO_ALGO,
    salt: process.env.CRYPTO_SALT,
    digest: process.env.CRYPTO_DIGEST,
    secretKey: process.env.CRYPTO_SECRET,
  },
  payment: {
    inr: {
      apiUrl: process.env.INR_PAYMENT_API_URL,
      card: {
        merchantId: process.env.INR_PAYMENT_CARD_MERCHANT_ID,
        apiKey: process.env.INR_PAYMENT_CARD_API_KEY,
        secretKey: process.env.INR_PAYMENT_CARD_SECRET_KEY,
      },
      ach: {
        merchantId: process.env.INR_PAYMENT_ACH_MERCHANT_ID,
        apiKey: process.env.INR_PAYMENT_ACH_API_KEY,
        secretKey: process.env.INR_PAYMENT_ACH_SECRET_KEY,
      },
    },
    usd: {
      apiUrl: process.env.USD_PAYMENT_API_URL,
      card: {
        merchantId: process.env.USD_PAYMENT_CARD_MERCHANT_ID,
        apiKey: process.env.USD_PAYMENT_CARD_API_KEY,
        secretKey: process.env.USD_PAYMENT_CARD_SECRET_KEY,
      },
      ach: {
        merchantId: process.env.USD_PAYMENT_ACH_MERCHANT_ID,
        apiKey: process.env.USD_PAYMENT_ACH_API_KEY,
        secretKey: process.env.USD_PAYMENT_ACH_SECRET_KEY,
      },
    },
  },
  database: {
    mysql: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      db: process.env.DB_NAME,
      timezone: "+00:00",
    },
  },
  mail: {
    from_name: process.env.SMTP_EMAIL_FROM_NAME,
    from_email: process.env.SMTP_EMAIL_FROM_EMAIL,
    is_smtp: true,
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_HOST_PORT,
      user: process.env.SMTP_USERNAME,
      password: process.env.SMTP_PASSWORD,
      isSecure: false,
    },
  },
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
  },
  google: {
    service_account_key: path.join(
      __dirname,
      "google",
      "firebase-service.json"
    ),
    project_id: process.env.FIREBASE_PROJECT_ID, // loyal-env-248207
    api_key: process.env.GOOGLE_API_KEY,
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  notification: {
    ios: {
      token: {
        key: path.join(__dirname, "ios-token", "AuthKey_SJQTVZK57P.p8"),
        keyId: "",
        teamId: "",
      },
      production: true,
    },
    android: {
      fcm: {
        server_key: "",
      },
    },
  },
  media: {
    staticMediaUrl: process.env.AWS_S3_BUCKET_URL,
  },
  region: {
    countryPhoneCode: process.env.COUNTRY_PHONE_CODE,
    currencySymbol: process.env.CURRENCY_ABBR,
  },

  aws: {
    bucketPrefix: process.env.AWS_BUCKET_PREFIX,
    bucketName: process.env.AWS_BUCKET_NAME,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketUrl: process.env.AWS_S3_BUCKET_URL,
    region: process.env.AWS_REGION,
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpireIn: process.env.JWT_EXPIRE_IN,
};
