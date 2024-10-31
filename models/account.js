'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      account.belongsTo(models.user);
      account.belongsTo(models.bank);
      account.hasMany(models.passbook)
    }
  }
  account.init({
    accountType: DataTypes.STRING,
    balance: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'account',
    underscored: true,
    paranoid: true
  });
  return account;
};