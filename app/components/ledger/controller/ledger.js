const { HttpStatusCode } = require("axios");
const Logger = require("../../../utils/logger");
const { setXTotalCountHeader } = require("../../../utils/response");
const LedgerService = require("../service/ledger.js");
class LedgerController {
  constructor() {
    this.ledgerService = new LedgerService();
  }

  async getAllLedgers(req, res, next) {
    try {
      Logger.info("get all ledgers controller started...");

      const { count, rows } = await this.ledgerService.getAllLedgers(req.query);
      setXTotalCountHeader(res, count);
      Logger.info("get all ledgers controller ended...");
      res.status(HttpStatusCode.Ok).json(rows);
    } catch (error) {
      next(error);
    }
  }

  async getLedgerById(req, res, next) {
    try {
      Logger.info("get ledger by id controller started...");

      const { ledgerId } = req.params;
      if (!validateUUID(ledgerId)) {
        throw new Error("invalid bank id...");
      }

      const response = await this.ledgerService.getLedgerById(
        ledgerId,
        req.query
      );
      Logger.info("get ledger by id controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const ledgerController = new LedgerController();
module.exports = ledgerController;