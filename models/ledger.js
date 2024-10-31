'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ledger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ledger.belongsTo(models.bank, {
        as: 'senderBank',
        foreignKey: 'senderBankId',
      });
      
      ledger.belongsTo(models.bank, {
        as: 'receiverBank',
        foreignKey: 'receiverBankId',
      });
    }
  }
  ledger.init({
    senderBankName: DataTypes.STRING,
    receiverBankName: DataTypes.STRING,
    totalAmount: DataTypes.DECIMAL,
    lastUpdated: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ledger',
    underscored: true,
    paranoid: true,
  });
  return ledger;
};