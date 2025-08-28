'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('countries', 'status', {
    type: Sequelize.ENUM( 'active', 'inactive', 'deleted'),
    defaultValue: 'inactive'
  }),
  down: (queryInterface) => queryInterface.removeColumn(
    'status',
  ),

};