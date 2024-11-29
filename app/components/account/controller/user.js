const { HttpStatusCode } = require("axios");
const AccountService = require("../service/user.js");
const { setXTotalCountHeader } = require("../../../utils/response.js");
const { validateUUID , createUUID } = require("../../../utils/uuid.js");
const { validateAccountType, validateAmount } = require("../../../utils/validations.js");
const Logger = require("../../../utils/logger.js");
const badRequest = require("../../../errors/badRequest.js");
const NotFoundError = require("../../../errors/notFoundError");
const accountConfig = require("../../../model-config/account-config");

class AccountController {
  constructor() {
    this.accountService = new AccountService();
  }

  async createAccount(req, res, next) {
    try {
      Logger.info("Create account controller started...");
      const userId = req.params.userId.trim();
      const bankId = req.params.bankId.trim();
      // const { userId, bankId } = req.params;
      const { accountType } = req.body;

      // console.log(userId)
      // console.log(bankId)
      // console.log(accountType)

      validateUUID(userId);
      validateUUID(bankId);
      validateAccountType(accountType);

      const newAccount = await this.accountService.createAccount(
        createUUID(),
        userId,
        bankId,
        accountType
      );

      Logger.info("Create account controller ended...");
      res.status(HttpStatusCode.Created).json(newAccount);
    } catch (error) {
      next(error);
    }
  }

  async getAllAccounts(req, res, next) {
    try {
      Logger.info("get all accounts controller called...");
      const { userId } = req.params;
      // if (!validateUUID(userId)) {
      //   throw new Error("invalid user id...");
      // }
      validateUUID(userId)
      const { count, rows } = await this.accountService.getAllAccounts(
        userId,
        req.query
      );
      setXTotalCountHeader(res, count);
      res.status(HttpStatusCode.Ok).json({
        data: rows,
        total: count,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccountById(req, res, next) {
    try {
      Logger.info("get account by id controller called...");
      const { userId, accountId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      const response = await this.accountService.getAccountById(
        userId,
        accountId,
        req.query
      );
      Logger.info("get account by id controller ended..");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccountById(req, res, next) {
    try {
      Logger.info("delete account by id controller started...");
      const { userId, accountId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      const response = await this.accountService.deleteAccountById(
        userId,
        accountId
      );
      if (!response)
        throw new NotFoundError("account not found or deletion failed...");

      Logger.info("delete account by id controller started...");
      res.status(HttpStatusCode.Ok).json({
        message: `Account with id ${accountId} is deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async depositUserAccount(req, res, next) {
    try {
      Logger.info("Deposit user account controller called...");
      const { amount } = req.body;
      const { userId, accountId } = req.params;

      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      // if (!validateUUID(bankId)) {
      //   throw new Error("invalid bank id...");
      // }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      if (amount <= 0)
        throw new badRequest(
          "invalid amount... amount cannot be less than or equal to zero"
        );

      const response = await this.accountService.depositUserAccount(
        userId,
        // bankId,
        accountId,
        amount
      );


      if (!response)
        throw new NotFoundError("account not found or deposit failed...");
      Logger.info("deposit user account controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async withdrawUserAccount(req, res, next) {
    try {
      Logger.info("withdraw user account controller started...");
      const { amount } = req.body;
      const { userId, accountId } = req.params;

      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      // if (!validateUUID(bankId)) {
      //   throw new Error("invalid bank id...");
      // }

      if (amount <= 0)
        throw new badRequest(
          "invalid amount... amount cannot be less than or equal to zero"
        );

      const response = await this.accountService.withDrawUserAccount(
        userId,
        accountId,
        amount
      );
      if (!response)
        throw new NotFoundError("account not found or deposit failed...");

      Logger.info("withdraw user controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getBalanceUserAccount(req, res, next) {
    try {
      Logger.info("get balance user account controller started...");

      const { userId, accountId } = req.params;

      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      const response = await this.accountService.getBalanceUserAccount(
        userId,
        accountId
      );
      Logger.info("get balance user account controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }
  async getTotalBalance(req, res, next) {
    try {
      Logger.info("get total balance controller started...");
      const { userId, bankId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(bankId)) {
        throw new Error("invalid bank id...");
      }
      const response = await this.accountService.getTotalBalance(
        userId,
        bankId
      );
      res.status(HttpStatusCode.Ok).json(response);
      Logger.info("get total balance controller ended...");
    } catch (error) {
      next(error);
    }
  }

  

  async transferBetweenUsers(req, res, next) {
    try {
      Logger.info("Transfer between users controller started...");
  
      const { userId, senderAccountId } = req.params;
      const {receiverAccountId, amount } = req.body;
  
      // Call the service function to execute the transfer
      const response = await this.accountService.transferBetweenUsers(
        userId,
        senderAccountId,
        receiverAccountId,
        amount
      );
  
      if (!response) throw new badRequest("Transfer failed.");
  
      Logger.info("Transfer between users controller ended successfully.");
      res.status(HttpStatusCode.Ok).json(response);
  
    } catch (error) {
      next(error);
    }
  }
  

}

const accountController = new AccountController();

module.exports = accountController;