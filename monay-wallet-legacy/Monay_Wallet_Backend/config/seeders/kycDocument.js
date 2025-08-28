'use strict';
const table = 'kyc_documents';
const listArray = [
  // India
  { documentKey: 'pan_card', requiredDocumentName: 'Pan card', countryCode: '+91', type: 'picture', uploadImageCount: 1 },
  { documentKey: 'aadhaar_card ', requiredDocumentName: 'Aadhaar card', countryCode: '+91', type: 'address', uploadImageCount: 2 },
  { documentKey: 'driving_licence', requiredDocumentName: 'Driving Licence', countryCode: '+1', type: 'picture', uploadImageCount: 1},

  // USA
  { documentKey: 'passport', requiredDocumentName: 'Passport', countryCode: '+1', type: 'picture' , uploadImageCount: 1},
  { documentKey: 'driving_licence', requiredDocumentName: 'Driving Licence', countryCode: '+1', type: 'picture',  uploadImageCount: 1 },
  { documentKey: 'national_id', requiredDocumentName: 'National id', countryCode: '+1', type: 'picture',  uploadImageCount: 1 },

  
  { documentKey: 'utility_bill', requiredDocumentName: 'Utility Bill', countryCode: '+1', type: 'address',  uploadImageCount: 1 },
  { documentKey: 'bank_statement', requiredDocumentName: 'Bank Statement', countryCode: '+1', type: 'address',  uploadImageCount: 1 },
  { documentKey: 'rental_contract', requiredDocumentName: 'Rental Contract', countryCode: '+1', type: 'address' ,  uploadImageCount: 1},
  { documentKey: 'post_marked_mail', requiredDocumentName: 'Post Marked Mail', countryCode: '+91', type: 'address',  uploadImageCount: 1 },
];
const data = listArray.map((element, index) => ({
  required_document_name: element.requiredDocumentName,
  document_key: element.documentKey,
  country_code: element.countryCode,
  upload_image_count: element.uploadImageCount,
  type: element.type,
  created_at: new Date(),
  updated_at: new Date(),
}));
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(table, data, {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete(table, null, {}),
};
