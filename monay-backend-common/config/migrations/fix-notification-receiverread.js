'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, drop the existing boolean column
    await queryInterface.removeColumn('notifications', 'receiverRead');
    
    // Then add the new ENUM column
    await queryInterface.addColumn('notifications', 'receiverRead', {
      type: Sequelize.ENUM('read', 'unread'),
      defaultValue: 'unread',
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the ENUM column
    await queryInterface.removeColumn('notifications', 'receiverRead');
    
    // Add back the boolean column
    await queryInterface.addColumn('notifications', 'receiverRead', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });
    
    // Drop the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_receiverRead";');
  }
};