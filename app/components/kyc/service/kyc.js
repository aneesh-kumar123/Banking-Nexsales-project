

const Logger = require("../../../utils/logger");
const { transaction, rollBack, commit } = require("../../../utils/transaction");
const kycConfig = require("../../../model-config/kyc-config");
const userConfig = require("../../../model-config/user-config");
const { Op } = require("sequelize");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");
const sendEmail = require("../../../utils/email");

class KYCService {
     
    async getUserKYC(userId, t) {
        if (!t) t = await transaction();

        try {
            Logger.info("Fetching KYC for user");

            const kyc = await kycConfig.model.findOne({
                where: { userId },
                transaction: t,
            });

            if (!kyc) throw new NotFoundError("KYC record not found");

            await commit(t);
            return kyc;
        } catch (error) {
            await rollBack(t);
            Logger.error(error);
            throw error;
        }
    }

    
    async submitKYC(userId, aadhar,pan, t) {
        if (!t) t = await transaction();

        try {
            Logger.info("Submitting KYC for user");

            const kyc = await kycConfig.model.findOne({
                where: { userId },
                transaction: t,
            });

            if (!kyc) throw new NotFoundError("KYC record not found");

            
            kyc.aadhar = aadhar;
            kyc.pan = pan,
            kyc.status = "submitted";
            kyc.adminNote = "";
            await kyc.save({ transaction: t });
            const user = await userConfig.model.findByPk(userId,{transaction:t});
            
            Logger.info("KYC submitted successfully");
            console.log("user email",user.email)
            await sendEmail(user.email,"KYC Submitted Successfully",`Hi ${user.firstName}! Your KYC has been successfully sumbitted.`)
            await commit(t);
           
            return kyc;
        } catch (error) {
            await rollBack(t);
            Logger.error(error);
            throw error;
        }
    }

    
    async getSubmittedKYCs(t) {
        if (!t) t = await transaction();
    
        try {
            Logger.info("Fetching submitted and pending KYCs for admin");
    


           
           
            const {count,rows:kycs} = await kycConfig.model.findAndCountAll({
                where: {
                    status: {
                        [Op.or]: ["submitted", "pending"], 
                    },
                },
                transaction: t,
            });
    
            
            for (const kyc of kycs) {
                if (kyc.status !== "pending") {
                    kyc.status = "pending";
                    await kyc.save({ transaction: t });
                }
            }
    
            await commit(t);
            Logger.info("Fetched and updated submitted KYCs to pending");
            return {count,kycs};
        } catch (error) {
            await rollBack(t);
            Logger.error(error);
            throw error;
        }
    }
    

    async updateKYCStatus(userId, status, adminNote, t) {
        if (!t) t = await transaction();
    
        try {
            Logger.info("Updating KYC status service");
    
             
            const kyc = await kycConfig.model.findOne({
                where: { userId:userId },
                transaction: t,
            });
    
            if (!kyc) throw new NotFoundError("KYC record not found");
    
           console.log("rejected admin ",adminNote)
            if (status === "rejected" && !adminNote) {
                throw new InvalidError("Rejection requires an admin note");
            }
    
            
            kyc.status = status;
            if (status === "approved") {
                kyc.adminNote = "";  
            }
            else if (adminNote) kyc.adminNote = adminNote;
    
             
            await kyc.save({ transaction: t });
            const user = await userConfig.model.findByPk(userId,{transaction:t});
            
            if(status==='approved'){
                await sendEmail(user.email,"KYC Approved",`Hi ${user.firstName}! Your KYC has been Approved.`)
            }
            if(status==='rejected'){
                await sendEmail(user.email,"KYC Rejected",`Hi ${user.firstName}! Your KYC request has been rejected. Reason for rejection is - ${adminNote}. fix the issue and submit your KYC again.` );
            }
            await commit(t);
            Logger.info("KYC status updated successfully");
            return kyc;
        } catch (error) {
            await rollBack(t);
            Logger.error(error);
            throw error;
        }
    }
    
}

module.exports = KYCService;