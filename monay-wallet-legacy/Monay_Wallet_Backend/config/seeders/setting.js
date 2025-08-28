'use strict';
const table = 'settings';
const listArray = [
  { name: 'Android App Version', key: 'android_app_version', value: '1.0.0', type: 'public' },
  { name: 'Android Build Force Update', key: 'android_force_update', value: '0', type: 'public' },
  { name: 'IOS App Version', key: 'ios_app_version', value: '1.0.0', type: 'public' },
  { name: 'IOS Build Force Update', key: 'ios_force_update', value: '0', type: 'public' },
  { name: 'API Url', key: 'api_url', value: '', type: 'public' },
  { name: 'Contact sync duration (in days)', key: 'contact_sync_duration', value: '7', type: 'public' },
  { name: 'Invite message', key: 'invite_message', value: 'I am inviting you to use monay app, a simple and secure payment app {appLink}', type: 'public' },
  { name: 'Non Kyc User Transaction Limit', key: 'non_kyc_user_transaction_limit', value: '', type: 'private' },
  { name: 'Kyc User Transaction Limit', key: 'kyc_user_transaction_limit', value: '', type: 'private' },
  { name: 'Transaction Limit days', key: 'transaction_limit_days', value: '', type: 'private' },
  { name: 'Twilio Account SID', key: 'twilio_account_sid', value: '', type: 'private' },
  { name: 'Twilio Auth Token', key: 'twilio_auth_token', value: '', type: 'private' },
  { name: 'Twilio From Number', key: 'twilio_from_number', value: '', type: 'private' },
  { name: 'SMTP Email From Name', key: 'smtp_email_from_name', value: '', type: 'private' },
  { name: 'SMTP Email From Email', key: 'smtp_email_from_email', value: '', type: 'private' },
  { name: 'SMTP Host', key: 'smtp_host', value: '', type: 'private' },
  { name: 'SMTP Port', key: 'smtp_port', value: '', type: 'private' },
  { name: 'SMTP Username', key: 'smtp_username', value: '', type: 'private' },
  { name: 'SMTP Password', key: 'smtp_password', value: '', type: 'private' },
  { name: 'Country Phone Code', key: 'country_phone_code', value: '', type: 'private' },
  { name: 'Currency Abbreviation', key: 'currency_abbr', value: '', type: 'private' },
  { name: 'Country Setting', key: 'is_country_setting', value: '0', type: 'private' },
];
const data = listArray.map((element, index) => ({
  name: element.name,
  key: element.key,
  value: element.value,
  setting_type: element.type,
  created_at: new Date(),
  updated_at: new Date(),
}));
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(table, data, {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete(table, null, {}),
};
