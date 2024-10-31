const { Op } = require("sequelize");
const db = require("../../models");
const { validateUUID } = require("../utils/uuid");

class BankConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      bankName: "bankName",
      abbreviation: "abbreviation",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt",
    };

    this.model = db.bank; 
    this.modelName = db.bank.name;
    this.tableName = db.bank.options.tableName;

    this.columnMapping = {
      id: this.model.rawAttributes[this.fieldMapping.id].field,
      bankName: this.model.rawAttributes[this.fieldMapping.bankName].field,
      abbreviation: this.model.rawAttributes[this.fieldMapping.abbreviation].field,
      createdAt: this.model.rawAttributes[this.fieldMapping.createdAt].field,
      updatedAt: this.model.rawAttributes[this.fieldMapping.updatedAt].field,
      deletedAt: this.model.rawAttributes[this.fieldMapping.deletedAt].field,
    };

    this.association = {
      account: "account",
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

      bankName: (val) => {
        return {
          [`${this.columnMapping.bankName}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },

      abbreviation: (val) => {
        return {
          [`${this.columnMapping.abbreviation}`]: {
            [Op.eq]: val,
          },
        };
      },
    };
  }
}

const bankConfig = new BankConfig();

module.exports = bankConfig;