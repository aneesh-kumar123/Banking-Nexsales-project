// const { HttpStatusCode } = require("axios");
// const Logger = require("../../../utils/logger");
// const InvalidError = require("../../../errors/invalidError");
// const KycService = require("../service/kyc");
// const { validateUUID } = require("../../../utils/uuid");

const KYCService = require("../service/kyc");
const Logger = require("../../../utils/logger");
const { HttpStatusCode } = require("axios");
const InvalidError = require("../../../errors/invalidError");
const NotFoundError = require("../../../errors/notFoundError");
const { setXTotalCountHeader } = require("../../../utils/response");

class KYCController {
    constructor() {
        this.kycService = new KYCService();
    }

     
    async getUserKYC(req, res, next) {
        try {
            Logger.info("Fetching KYC for user");

            const { userId } = req.params;

            const kyc = await this.kycService.getUserKYC(userId);
            res.status(HttpStatusCode.Ok).json(kyc);
        } catch (error) {
            next(error);
        }
    }

     
    async submitKYC(req, res, next) {
        try {
            Logger.info("Submitting KYC for user");

            const { userId } = req.params;
            const { aadhar,pan } = req.body;
             
            console.log("aadhar ",aadhar);
            console.log("pan ",pan);
            
            if (!aadhar) throw new InvalidError("aadhar is required");
            if (!pan) throw new InvalidError("pan is required");
            console.log("come on")
            const kyc = await this.kycService.submitKYC(userId, aadhar,pan);
            res.status(HttpStatusCode.Created).json(kyc);
        } catch (error) {
            next(error);
        }
    }

     
    async getSubmittedKYCs(req, res, next) {
        try {
            Logger.info("Fetching all submitted KYCs");

            const {count,kycs} = await this.kycService.getSubmittedKYCs();
            setXTotalCountHeader(res, count);
            res.status(HttpStatusCode.Ok).json(kycs);
        } catch (error) {
            next(error);
        }
    }

    
    async updateKYCStatus(req, res, next) {
        try {
            Logger.info("Updating KYC status");

            
            const { userId,status, adminNote } = req.body;
           
            if (!["approved", "rejected"].includes(status)) {
                throw new InvalidError("Invalid status. Only 'approved' or 'rejected' allowed");
            }

            const kyc = await this.kycService.updateKYCStatus(userId, status, adminNote);
            res.status(HttpStatusCode.Ok).json(kyc);
        } catch (error) {
            next(error);
        }
    }
}

const kycController = new KYCController();
module.exports = kycController;