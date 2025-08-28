'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.changeColumn('user_kycs', 'id_proof_back_image', {
            type: Sequelize.STRING,
            defaultValue: null
        }, { transaction: t }),
        queryInterface.addColumn('user_kycs', 'address_proof_back_image', {
            type: Sequelize.STRING,
        }, { transaction: t }),
    ])),
    down: (queryInterface) => queryInterface.sequelize.transaction((t) => Promise.all([
        queryInterface.removeColumn('user_kycs', 'id_proof_back_image', {
            transaction: t,
        }),
        queryInterface.removeColumn('user_kycs', 'address_proof_back_image', {
            transaction: t,
        }),
    ])),
};


