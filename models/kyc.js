'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class kyc extends Model {
    static associate(models) {
      kyc.belongsTo(models.user, {
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        hooks: true,
      });
    }
  }
  kyc.init(
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      aadhar: {
        type: DataTypes.STRING,
        
      },
      pan: {
        type: DataTypes.STRING,
        
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "not submitted",
        validate: {
          isIn: [['not submitted', 'submitted', 'pending', 'approved', 'rejected']],
        },
      },
      adminNote: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "kyc",
      underscored: true,
      paranoid: true,  
    }
  );
  return kyc;
};