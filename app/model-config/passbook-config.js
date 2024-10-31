const db = require("../../models");

class PassbookConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      accountId:"accountId",
      transactionType: "transactionType",
      amount: "amount",
      balanceAfter: "balanceAfter",
      accountId: "accountId",
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
      transactionType: this.model.rawAttributes[this.fieldMapping.transactionType].field,
      amount: this.model.rawAttributes[this.fieldMapping.amount].field,
      balanceAfter: this.model.rawAttributes[this.fieldMapping.balanceAfter].field,
      accountId: this.model.rawAttributes[this.fieldMapping.accountId].field,
      createdAt: this.model.rawAttributes[this.fieldMapping.createdAt].field,
      updatedAt: this.model.rawAttributes[this.fieldMapping.updatedAt].field,
      deletedAt: this.model.rawAttributes[this.fieldMapping.deletedAt].field,
    };
  }
}

const passbookConfig = new PassbookConfig();

module.exports = passbookConfig;
