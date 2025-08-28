'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.changeColumn('users', 'user_type', {
            type: Sequelize.ENUM('admin', 'user', 'merchant', 'subadmin', 'secondaryUser'),
            defaultValue: null
        }, { transaction: t }),
        queryInterface.addColumn('users', 'referral_code', {
            type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.addColumn('users', 'minimum_wallet_amount', {
            type: Sequelize.INTEGER,
        }, { transaction: t }),
        queryInterface.addColumn('users', 'refile_wallet_amount', {
            type: Sequelize.INTEGER,
        }, { transaction: t }),
        queryInterface.addColumn('users', 'card_id', {
            type: Sequelize.INTEGER,
        }, { transaction: t }),
    ])),
    down: (queryInterface) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.removeColumn('users', 'user_type', {
            transaction: t,
        }),
        queryInterface.removeColumn('users', 'referral_code', {
            transaction: t,
        }),
        queryInterface.removeColumn('users', 'minimum_wallet_amount', {
            transaction: t,
        }),
        queryInterface.removeColumn('users', 'refile_wallet_amount', {
            transaction: t,
        }),
        queryInterface.removeColumn('users', 'card_id', {
            transaction: t,
        }),
    ])),
};


