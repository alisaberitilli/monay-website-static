'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('transactions', 'parent_id', {
    type: Sequelize.INTEGER
  }),
  down: (queryInterface) => queryInterface.removeColumn(
    'parent_id',
  ),

};