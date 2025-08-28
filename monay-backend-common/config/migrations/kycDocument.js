'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('kyc_documents', 'upload_image_count', {
    type: Sequelize.INTEGER,
    defaultValue: 1
  }),
  down: (queryInterface) => queryInterface.removeColumn('kyc_documents',
    'upload_image_count',
  ),

};