'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('banks', {
      fields: ['bank_name'],
      type: 'unique',
      name: 'unique_bank_name', // Custom constraint name
    });

    await queryInterface.addConstraint('banks', {
      fields: ['abbreviation'],
      type: 'unique',
      name: 'unique_abbreviation', // Custom constraint name
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('banks', 'unique_bank_name');
    await queryInterface.removeConstraint('banks', 'unique_abbreviation');
  },
};
