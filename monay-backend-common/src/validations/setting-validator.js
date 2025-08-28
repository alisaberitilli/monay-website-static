import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';

const Joi = BaseJoi.extend(Extension);

const updateSettingSchema = Joi.object().keys({
    twilio_account_sid: Joi.string()
        .optional()
        .empty()
        .allow(''),
    twilio_auth_token: Joi.string()
        .optional()
        .empty()
        .allow(''),
    twilio_from_number: Joi.string()
        .optional()
        .empty()
        .allow(''),
    smtp_email_from_name: Joi.string()
        .optional()
        .empty()
        .allow(''),
    smtp_email_from_email: Joi.string()
        .optional()
        .empty()
        .allow(''),
    smtp_host: Joi.string()
        .optional()
        .empty()
        .allow(''),
    smtp_port: Joi.string()
        .optional()
        .empty()
        .allow(''),
    smtp_username: Joi.string()
        .optional()
        .empty()
        .allow(''),
    smtp_password: Joi.string()
        .optional()
        .empty()
        .allow(''),
    non_kyc_user_transaction_limit: Joi.string()
        .optional()
        .empty()
        .allow(''),
    kyc_user_transaction_limit: Joi.string()
        .optional()
        .empty()
        .allow(''),
    transaction_limit_days: Joi.string()
        .optional()
        .empty()
        .allow(''),
    setting_type: Joi.string()
        .optional()
        .empty()
        .allow(''),
});
const updateCountrySettingSchema = Joi.object().keys({
    country_phone_code: Joi.string()
        .required(),
    currency_abbr: Joi.string()
        .required()

});

export default {
    updateSettingSchema,
    updateCountrySettingSchema
};
