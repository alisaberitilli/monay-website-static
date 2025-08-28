'use strict';
const table = 'countries';
const listArray = [
  { code: 'IN', name: 'India', country_calling_code: '+91', currency_code: 'INR' , status: 'active'},
  { code: 'USA', name: 'United States', country_calling_code: '+1', currency_code: 'USD', status: 'active'},
];
const data = listArray.map((element, index) => ({
  code: element.code,
  name: element.name,
  country_calling_code: element.country_calling_code,
  currency_code: element.currency_code,
  status: element?.status ?? 'inactive',
  created_at: new Date(),
  updated_at: new Date(),
}));
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(table, data, {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete(table, null, {}),
};
