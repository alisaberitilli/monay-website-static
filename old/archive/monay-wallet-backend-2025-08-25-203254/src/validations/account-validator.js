import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';
import utility from '../services/utility';

const Joi = BaseJoi.extend(Extension);

const loginSchema = Joi.object({
  email: Joi.string()
    .label('Email')
    .required(),
  password: Joi.string().required(),
  firebaseToken: Joi.string()
    .optional()
    .empty()
    .allow(''),
  deviceType: Joi.string()
    .valid('android', 'ios', 'web')
    .required()
});


const userAccountloginSchema = Joi.object({
  phoneCountryCode: Joi.string()
    .optional()
    .empty()
    .allow(''),
  username: Joi.string()
    .label('Phone or Email')
    .required(),
  password: Joi.string().required(),
  firebaseToken: Joi.string()
    .optional()
    .empty()
    .allow(''),
  deviceType: Joi.string()
    .valid('android', 'ios', 'web')
    .required()
});


const mPinLoginSchema = Joi.object({
  phoneCountryCode: Joi.string()
    .optional()
    .empty()
    .allow(''),
  username: Joi.string()
    .label('Phone or Email')
    .required(),
  mpin: Joi.string().required(),
  firebaseToken: Joi.string()
    .optional()
    .empty()
    .allow(''),
  deviceType: Joi.string()
    .valid('android', 'ios', 'web')
    .required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(6)
    .max(15)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'PASSWORD_REGEX'),
          }
        },
      },
    }),
  confirmNewPassword: Joi.string()
    .required()
    .valid(Joi.ref('newPassword'))
    .options({
      language: {
        any: {
          allowOnly: utility.getMessage({}, false, 'PASSWORD_NOT_MATCH'),
        },
      },
    })
});

const adminForgotPasswordSchema = Joi.object().keys({
  email: Joi.string().email().required()
});

const resetPasswordByTokenSchema = Joi.object().keys({
  newPassword: Joi.string()
    .min(6)
    .max(15)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'PASSWORD_REGEX'),
          }
        },
      },
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('newPassword'))
    .options({
      language: {
        any: {
          allowOnly: utility.getMessage({}, false, 'PASSWORD_NOT_MATCH'),
        },
      },
    }),
  token: Joi.string().required()
});
const adminProfileUpdateSchema = Joi.object({
  firstName: Joi.string()
    .min(3)
    .max(20)
    .required(),
  lastName: Joi.string()
    .min(3)
    .max(20)
    .required(),
  email: Joi.string()
    .email()
    .min(6)
    .max(100)
    .required(),
  profilePicture: Joi.string()
    .optional()
    .empty()
    .allow(''),
  phoneNumberCountryCode: Joi.string().optional()
    .empty()
    .allow(''),
  phoneNumber: Joi.string()
    .regex(/^(?!0+$)[0-9]{4,15}$/)
    .optional()
    .empty()
    .allow('')
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'PHONE_NUMBER_FORMATE'),
          }
        },
      },
    }),
});
const signupSchema = Joi.object().keys({
  firstName: Joi.string()
    .min(3)
    .max(25)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'FIRST_NAME_LENGTH'),
          }
        },
      },
    }),
  lastName: Joi.string()
    .min(3)
    .max(25)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'LAST_NAME_LENGTH'),
          }
        },
      },
    }),
  email: Joi.string()
    .email()
    .min(6)
    .max(100)
    .optional()
    .allow(''),
  phone_number: Joi.string()
    .regex(/^\+?[0-9]{7,20}$/)
    .optional(),
  mobile: Joi.string()
    .regex(/^\+?[0-9]{7,20}$/)
    .optional(),
  password: Joi.string()
    .min(6)
    .max(15)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'PASSWORD_REGEX'),
          }
        },
      },
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .options({
      language: {
        any: {
          allowOnly: utility.getMessage({}, false, 'PASSWORD_NOT_MATCH'),
        },
      },
    }),
  firebaseToken: Joi.string()
    .optional()
    .empty()
    .allow(''),
  deviceType: Joi.string()
    .valid('android', 'ios', 'web')
    .required(),
  referralCode:Joi.allow(),
  termsAccepted: Joi.boolean()
    .optional()
});
const merchantSignupSchema = Joi.object().keys({
  firstName: Joi.string()
    .min(3)
    .max(25)
    .required()
    .error(() => {
      return {
        message: utility.getMessage({}, false, 'FIRST_NAME_LENGTH'),
      };
    }),
  lastName: Joi.string()
    .min(3)
    .max(25)
    .required()
    .error(() => {
      return {
        message: utility.getMessage({}, false, 'LAST_NAME_LENGTH'),
      };
    }),
  email: Joi.string()
    .email()
    .min(6)
    .max(100)
    .required(),
  phone_number: Joi.string()
    .regex(/^\+?[0-9]{7,20}$/)
    .optional(),
  mobile: Joi.string()
    .regex(/^\+?[0-9]{7,20}$/)
    .optional(),
  password: Joi.string()
    .min(6)
    .max(15)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'PASSWORD_REGEX'),
          }
        },
      },
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .options({
      language: {
        any: {
          allowOnly: utility.getMessage({}, false, 'PASSWORD_NOT_MATCH'),
        },
      },
    }),
  companyName: Joi.string()
    .min(3)
    .max(50)
    .required()
    .error(() => {
      return {
        message: utility.getMessage({}, false, 'COMPANY_NAME_LENGTH'),
      };
    }),
  taxId: Joi.string()
    .min(2)
    .max(50)
    .required(),
  chamberOfCommerce: Joi.string()
    .min(2)
    .max(50)
    .required(),
  firebaseToken: Joi.string()
    .optional()
    .empty()
    .allow(''),
  deviceType: Joi.string()
    .valid('android', 'ios', 'web')
    .required()
});
const verifyOtpSchema = Joi.object({
  phoneNumberCountryCode: Joi.string().required(),
  username: Joi.string().required(),
  otp: Joi.string()
    .regex(/^[0-9]{6}$/)
    .length(6)
    .required(),
});

const verifyPrimaryOtpSchema = Joi.object({
  otp: Joi.string()
    .regex(/^[0-9]{6}$/)
    .length(6)
    .required(),
});
const resendOtpSchema = Joi.object({
  phoneNumberCountryCode: Joi.string()
    .optional()
    .empty()
    .allow(''),
  username: Joi.string().required()
});

const resetPasswordSchema = Joi.object().keys({
  phoneNumberCountryCode: Joi.string()
    .optional()
    .empty()
    .allow(''),
  username: Joi.string().required(),
  newPassword: Joi.string()
    .min(6)
    .max(15)
    // .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,15}$/)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'PASSWORD_REGEX'),
          }
        },
      },
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('newPassword'))
    .options({
      language: {
        any: {
          allowOnly: utility.getMessage({}, false, 'PASSWORD_NOT_MATCH'),
        },
      },
    }),
  otp: Joi.string()
    .regex(/^[0-9]{6}$/)
    .length(6)
    .required(),
});
const sendOtpSchema = Joi.object({
  phoneNumberCountryCode: Joi.string().required(),
  phoneNumber: Joi.string()
    .regex(/^(?!0+$)[0-9]{4,15}$/)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'PHONE_NUMBER_FORMATE'),
          }
        },
      },
    }),
  userType: Joi.string()
    .valid('user', 'merchant', 'secondary_user')
    .required()
});

export default {
  loginSchema,
  changePasswordSchema,
  adminForgotPasswordSchema,
  resetPasswordByTokenSchema,
  adminProfileUpdateSchema,
  signupSchema,
  merchantSignupSchema,
  verifyOtpSchema,
  userAccountloginSchema,
  resendOtpSchema,
  resetPasswordSchema,
  mPinLoginSchema,
  sendOtpSchema,
  verifyPrimaryOtpSchema
};
