import Joi from 'joi';
import utility from '../services/utility.js';

const changeStatusSchema = Joi.object({
    status: Joi.string()
        .valid('active', 'inactive')
        .required(),
});

const changeKycStatusSchema = Joi.object({
    reason: Joi.string()
        .optional()
        .empty()
        .allow(''),
    status: Joi.string()
        .valid('approved', 'rejected')
        .required(),
});

const userProfileUpdateSchema = Joi.object().keys({
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

    profilePicture: Joi.string()
        .optional()
        .empty()
        .allow(''),
});

const userKycSchema = Joi.object().keys({
    idProofName: Joi.string().required(),
    idProofImage: Joi.string().required(),
    addressProofName: Joi.string().required(),
    addressProofImage: Joi.string().required(),
    addressProofBackImage: Joi.string().trim().optional().allow(null).empty().allow(''),
    idProofBackImage: Joi.string().trim().optional().allow(null).empty().allow(''),
});
const merchantProfileUpdateSchema = Joi.object().keys({
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
    companyName: Joi.string()
        .min(3)
        .max(150)
        .required(),
    taxId: Joi.string()
        .min(2)
        .max(50)
        .required(),
    chamberOfCommerce: Joi.string()
        .min(2)
        .max(50)
        .required(),
    profilePicture: Joi.string()
        .optional()
        .empty()
        .allow(''),
});
const checkUserPhoneNumberSchema = Joi.object({
    phoneNumberCountryCode: Joi.string()
        .optional()
        .empty()
        .allow(''),
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
});

const checkUserEmailSchema = Joi.object({
    email: Joi.string()
        .email()
        .min(6)
        .max(100)
        .required()
});
const verifyMpinOtpSchema = Joi.object({
    phoneNumberCountryCode: Joi.string()
        .optional()
        .empty()
        .allow(''),
    username: Joi.string().required(),
    otp: Joi.string()
        .regex(/^[0-9]{6}$/)
        .length(6)
        .required(),
});
const resetMpinOtpSchema = Joi.object({
    phoneNumberCountryCode: Joi.string()
        .optional()
        .empty()
        .allow(''),
    username: Joi.string().required(),
    otp: Joi.string()
        .regex(/^[0-9]{6}$/)
        .length(6)
        .required(),
    mpin: Joi.string()
        .regex(/^[0-9]{4}$/)
        .length(4)
        .required(),
    confirmMpin: Joi.string()
        .required()
        .valid(Joi.ref('mpin'))
        .options({
            language: {
                any: {
                    allowOnly: utility.getMessage({}, false, 'MPIN_NOT_MATCH'),
                },
            },
        }),
});
const verifyMpinSchema = Joi.object({
    mpin: Joi.string()
        .regex(/^[0-9]{4}$/)
        .length(4)
        .required(),
});

const changeMpinOtpSchema = Joi.object({
    currentMpin: Joi.string()
        .regex(/^[0-9]{4}$/)
        .length(4)
        .required(),
    mpin: Joi.string()
        .regex(/^[0-9]{4}$/)
        .length(4)
        .required(),
    confirmMpin: Joi.string()
        .required()
        .valid(Joi.ref('mpin'))
        .options({
            language: {
                any: {
                    allowOnly: utility.getMessage({}, false, 'MPIN_NOT_MATCH'),
                },
            },
        }),
});

const setmPinSchema = Joi.object({
    mpin: Joi.string()
        .regex(/^[0-9]{4}$/)
        .length(4)
        .required()
});
const verifyChangePhonenumberSchema = Joi.object({
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
    otp: Joi.string()
        .regex(/^[0-9]{6}$/)
        .length(6)
        .required(),
});
const verifyChangeEmailSchema = Joi.object({
    email: Joi.string()
        .email()
        .min(6)
        .max(100)
        .required(),
    otp: Joi.string()
        .regex(/^[0-9]{6}$/)
        .length(6)
        .required(),
});
const forgotMpinSchema = Joi.object({
    phoneNumberCountryCode: Joi.string()
        .optional()
        .empty()
        .allow(''),
    username: Joi.string().required()
});
const updateSubadminSchema = Joi.object({
    id: Joi.number()
        .required(),
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
    password: Joi.string().optional().empty()
        .allow(''),
    roleId: Joi.number()
        .optional()
        .empty()
        .allow(''),
    status: Joi.string()
        .valid('active', 'inactive')
        .required(),
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
const subadminSignupSchema = Joi.object({
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
    password: Joi.string().required(),
    roleId: Joi.number()
        .optional()
        .empty()
        .allow(''),
    status: Joi.string()
        .valid('active', 'inactive')
        .required(),
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

const changeLimitSchema = Joi.object({
    limit: Joi.number().integer().greater(0)
        .label('Limit')
        .required(),
});
const walletLimitSchema = Joi.object({
    refillWalletAmount: Joi.number().integer().greater(0)
        .label('Refill wallet amount')
        .required(),
    minimumWalletAmount: Joi.number().integer().greater(0)
        .label('Minimum wallet amount')
        .required(),
    cardId: Joi.string()
        .optional()
        .empty()
        .allow(''),
    paymentMethod: Joi.string()
        .valid('card')
        .required(),
    cardType: Joi.string()
        .empty()
        .allow('')
        .optional(),
    cardNumber: Joi.string()
        .empty()
        .allow('')
        .optional(),
    nameOnCard: Joi.string()
        .empty()
        .allow('')
        .optional(),
    month: Joi.string()
        .empty()
        .allow('')
        .optional(),
    year: Joi.string()
        .empty()
        .allow('')
        .optional(),
    cvv: Joi.string()
        .regex(/^(?!0+$)[0-9]{3,4}$/)
        .empty()
        .allow('')
        .optional()
        .options({
            language: {
                string: {
                    regex: {
                        base: utility.getMessage({}, false, 'AMOUNT_REGEX'),
                    }
                },
            },
        }),
    saveCard: Joi.string()
        .empty()
        .allow('')
        .optional(),
    mpin: Joi.string()
        .regex(/^[0-9]{4}$/)
        .length(4)
        .required(),
});

const autoToupSchema = Joi.object({
    autoToupStatus: Joi.string().trim().valid('true', 'false')
        .label('Auto Toup status')
        .required(),
});
export default {
    changeStatusSchema,
    userProfileUpdateSchema,
    merchantProfileUpdateSchema,
    setmPinSchema,
    checkUserPhoneNumberSchema,
    verifyMpinOtpSchema,
    verifyMpinSchema,
    resetMpinOtpSchema,
    changeMpinOtpSchema,
    verifyChangePhonenumberSchema,
    checkUserEmailSchema,
    forgotMpinSchema,
    changeKycStatusSchema,
    userKycSchema,
    verifyChangeEmailSchema,
    updateSubadminSchema,
    subadminSignupSchema,
    changeLimitSchema,
    walletLimitSchema,
    autoToupSchema
};
