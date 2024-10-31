'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ledgers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,  // Ensure UUID is auto-generated
      },
      sender_bank_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      receiver_bank_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      sender_bank_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      receiver_bank_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,  // Auto-update on creation
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  // Default value to avoid null issues
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  // Default value to ensure timestamps
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ledgers');
  },
};
