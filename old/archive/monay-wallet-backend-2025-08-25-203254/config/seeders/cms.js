'use strict';

const table = 'cms';
const listArray = [
  { page_key: 'how_it_works', page_name: 'How It Works', user_type: 'user' },
  { page_key: 'how_it_works', page_name: 'How It Works', user_type: 'merchant' },
  { page_key: 'terms_conditions', page_name: 'Terms & Conditions', user_type: 'user' },
  { page_key: 'terms_conditions', page_name: 'Terms & Conditions', user_type: 'merchant' },
  { page_key: 'privacy_policy', page_name: 'Privacy Policy', user_type: 'user' },
  { page_key: 'privacy_policy', page_name: 'Privacy Policy', user_type: 'merchant' }
];
const data = listArray.map((element, index) => ({
  page_key: element.page_key,
  page_name: element.page_name,
  user_type: element.user_type,
  created_at: new Date(),
  updated_at: new Date(),
}));
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(table, data, {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete(table, null, {}),
};
