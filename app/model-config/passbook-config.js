const db = require("../../models");
const { validateUUID } = require("../utils/uuid");
const { Op } = require("sequelize");

class PassbookConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      accountId: "accountId",
      recipientAccountId: "recipientAccountId", // Added recipientAccountId
      transactionType: "transactionType",
      amount: "amount",
      balanceAfter: "balanceAfter",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt",
    };

    this.model = db.passbook;
    this.modelName = db.passbook.name;
    this.tableName = db.passbook.options.tableName;

    this.columnMapping = {
      id: this.model.rawAttributes[this.fieldMapping.id].field,
      accountId: this.model.rawAttributes[this.fieldMapping.accountId].field,
      recipientAccountId: this.model.rawAttributes[this.fieldMapping.recipientAccountId].field,
      transactionType: this.model.rawAttributes[this.fieldMapping.transactionType].field,
      amount: this.model.rawAttributes[this.fieldMapping.amount].field,
      balanceAfter: this.model.rawAttributes[this.fieldMapping.balanceAfter].field,
      createdAt: this.model.rawAttributes[this.fieldMapping.createdAt].field,
      updatedAt: this.model.rawAttributes[this.fieldMapping.updatedAt].field,
      deletedAt: this.model.rawAttributes[this.fieldMapping.deletedAt].field,
    };

    this.filters = {
      id: (val) => {
        validateUUID(val);
        return {
          [`${this.columnMapping.id}`]: {
            [Op.eq]: val,
          },
        };
      },
      accountId: (val) => {
        validateUUID(val);
        return {
          [`${this.columnMapping.accountId}`]: {
            [Op.eq]: val,
          },
        };
      },
      recipientAccountId: (val) => { // Added filter for recipientAccountId
        validateUUID(val);
        return {
          [`${this.columnMapping.recipientAccountId}`]: {
            [Op.eq]: val,
          },
        };
      },
    };
  }
}

const passbookConfig = new PassbookConfig();

module.exports = passbookConfig;
