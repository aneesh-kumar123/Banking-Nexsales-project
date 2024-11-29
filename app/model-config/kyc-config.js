const {Sequelize,Op} = require("sequelize");
const db = require("../../models");
const {validateUUID} = require("../utils/uuid");

class KycConfig{
    constructor(){

    this.fieldMapping = {
        id:"id",
        userId:"userId",
        aadhar:"aadhar",
        pan:"pan",
        status:"status",
        adminNote:"adminNote",
        createdAt :"createdAt",
        updatedAt : "updatedAt",
        deletedAt : "deletedAt"
    }

    this.model = db.kyc
    this.modelName = db.kyc.name
    this.tableName = db.kyc.options.tableName
    
    this.columnMapping = {
        id : this.model.rawAttributes[this.fieldMapping.id].field,
        userId : this.model.rawAttributes[this.fieldMapping.userId].field,
        aadhar : this.model.rawAttributes[this.fieldMapping.aadhar].field,
        pan : this.model.rawAttributes[this.fieldMapping.pan].field,
        status : this.model.rawAttributes[this.fieldMapping.status].field,
        adminNote : this.model.rawAttributes[this.fieldMapping.adminNote].field,
        createdAt : this.model.rawAttributes[this.fieldMapping.createdAt].field,
        updatedAt : this.model.rawAttributes[this.fieldMapping.updatedAt].field,
        deletedAt : this.model.rawAttributes[this.fieldMapping.deletedAt].field
    }

    this.association = {
        user : "user"
    }

    this.filters = {
        id : (val) => {
            validateUUID(val);
            return {
                [`${this.columnMapping.id}`]: {
                    [Op.eq] : val
                }
            }
        },
        userId : (val) => {
            validateUUID(val);
            return {
                [`${this.columnMapping.userId}`]: {
                    [Op.eq] : val
                }
            }
        },
        aadhar : (val) => {
            return {
                [`${this.columnMapping.aadhar}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        pan : (val) => {
            return {
                [`${this.columnMapping.pan}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        status : (val) => {
            return {
                [`${this.columnMapping.status}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        adminNote : (val) => {
            return {
                [`${this.columnMapping.adminNote}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        }
    }

}
}

const kycConfig = new KycConfig();
module.exports = kycConfig;