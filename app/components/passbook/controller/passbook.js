const { HttpStatusCode } = require("axios");
const Logger = require("../../../utils/logger");
const { setXTotalCountHeader } = require("../../../utils/response");
const { validateUUID } = require("../../../utils/uuid");
const PassbookService = require("../service/passbook");

class PassbookController {
  constructor() {
    this.passbookService = new PassbookService();
  }

  async viewPassbook(req, res, next) {
    try {
      Logger.info("View passbook controller started...");
      const { userId, accountId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      const { count, rows } = await this.passbookService.viewPassbook(
        userId,
        accountId,
        req.query,
        t
      );
      setXTotalCountHeader(res, count);
      res.status(HttpStatusCode.Ok).json(rows);
    } catch (error) {
      next(error);
    }
  }
}

const passbookController = new PassbookController();
module.exports = passbookController;