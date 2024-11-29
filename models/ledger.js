"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ledger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ledger.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      senderBankId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      receiverBankId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      senderBankName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      receiverBankName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
      lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ledger",
      underscored: true,
      paranoid: true,
    }
  );
  return ledger;
};