'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class passbook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      passbook.belongsTo(models.account, { as: 'Account', foreignKey: 'account_id' }); // Original association
      passbook.belongsTo(models.account, { as: 'RecipientAccount', foreignKey: 'recipient_account_id' }); // New association
    }
  }
  passbook.init(
    {
      transactionType: DataTypes.STRING,
      amount: DataTypes.NUMERIC,
      balanceAfter: DataTypes.NUMERIC,
      recipientAccountId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'passbook',
      underscored: true,
      paranoid: true,
    }
  );
  return passbook;
};
