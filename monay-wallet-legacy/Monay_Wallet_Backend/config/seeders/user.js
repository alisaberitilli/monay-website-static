'use strict';

const table = 'users';
const listArray = [
    { email: 'monay@mailinator.com', password: '$2a$10$y1k0MX3gKtUDMtxfVjTd8./u9QBeCXyRGWw39EYPH3S416OwKE6Em', first_name: 'Monay', last_name: 'Admin', user_type: 'admin', status: 'active' },
];
const data = listArray.map((element, index) => ({
    email: element.email,
    password: element.password,
    first_name: element.first_name,
    last_name: element.last_name,
    user_type: element.user_type,
    status: element.status,
    created_at: new Date(),
    updated_at: new Date(),
}));
module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert(table, data, {}),

    down: (queryInterface, Sequelize) => queryInterface.bulkDelete(table, null, {}),
};
