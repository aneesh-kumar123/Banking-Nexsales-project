'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('passbooks', 'recipient_account_id', {
      type: Sequelize.UUID,
      allowNull: true, 
      references: {
        model: 'accounts', 
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('passbooks', 'recipient_account_id');
  },
};
