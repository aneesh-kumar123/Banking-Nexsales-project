const { HttpStatusCode } = require("axios");
const BankService = require("../service/user");
const { createUUID, validateUUID } = require("../../../utils/uuid.js");
const { setXTotalCountHeader } = require("../../../utils/response.js");
const Logger = require("../../../utils/logger.js");
const badRequest = require("../../../errors/badRequest.js");
const {validateBankName,validateAbbreviation,validateParameter} = require("../../../utils/validations.js");
const NotFoundError = require("../../../errors/notFoundError");

class BankController {
  constructor() {
    this.bankService = new BankService();
  }

  async createBank(req, res, next) {
    try {
      Logger.info("Create bank controller started...");

      // Ensure only admin can create a bank (can also be handled via middleware)
      const { bankName, abbreviation } = req.body;
      validateBankName(bankName);
      validateAbbreviation(abbreviation);

      // if (typeof bankName !== "string") 
      //   throw new badRequest("Invalid bankName type");
      // if (typeof abbreviation !== "string") 
      //   throw new badRequest("Invalid abbreviation type");

      let response = await this.bankService.createBank(
        createUUID(),
        bankName,
        abbreviation
      );

      Logger.info("Create bank controller ended...");
      res.status(HttpStatusCode.Created).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllBanks(req, res, next) {
    try {
      Logger.info("get all banks controller started...");
      console.log("the query we got here is:",req.query)
      console.log("the query we got ")

      const { count, rows } = await this.bankService.getAllBanks(req.query);
      // console.log("thre response we got here is:",rows)
      console.log("thre count we got here is:",count)
      setXTotalCountHeader(res, count);
      Logger.info("get all banks controller ended...");
      res.status(HttpStatusCode.Ok).json( {
        data: rows,
        total: count,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBankById(req, res, next) {
    try {
      Logger.info("get bank by id controller called...");
      const { bankId } = req.params;
      if (!validateUUID(bankId)) {
        throw new Error("invalid bank id...");
      }

      const response = await this.bankService.getBankById(bankId, req.query);
      Logger.info("get bank by id controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateBankById(req, res, next) {
    try {
      Logger.info("update bank by id controller called...");
      const { bankId } = req.params;
      const { parameter, value } = req.body;

      // if (typeof parameter != "string")
      //   throw new badRequest("invalid parameter type....");
      validateParameter(parameter)
      if (!validateUUID(bankId)) {
        throw new Error("invalid user id...");
      }

      const response = await this.bankService.updateBankById(
        bankId,
        parameter,
        value
      );
      if (!response)
        throw new NotFoundError("bank not found or bank updation failed...");
      res
        .status(HttpStatusCode.Ok)
        .json({ message: `Bank with id ${bankId} is updated successfully` });
    } catch (error) {
      next(error);
    }
  }

  async deleteBankById(req, res, next) {
    try {
      Logger.info("delete bank by id controller started...");
      const { bankId } = req.params;
      if (!validateUUID(bankId)) {
        throw new Error("invalid bank id...");
      }
      const response = await this.bankService.deleteBankById(bankId);
      if (!response)
        throw new NotFoundError("bank not found or deletion failed...");

      res.status(HttpStatusCode.Ok).json({
        message: `bank with id ${bankId} is deleted successfully`,
      });
      Logger.info("delete bank by id controller started...");
    } catch (error) {
      next(error);
    }
  }
}

const bankController = new BankController();
module.exports = bankController;
