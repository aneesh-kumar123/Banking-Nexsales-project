const NotFoundError = require("../../../errors/notFoundError");
const accountConfig = require("../../../model-config/account-config");
const passbookConfig = require("../../../model-config/passbook-config");
const userConfig = require("../../../model-config/user-config");
const Logger = require("../../../utils/logger");
const {
  parseSelectFields,
  parseLimitAndOffset,
} = require("../../../utils/request");
const { transaction, commit, rollBack } = require("../../../utils/transaction");

class PassbookService {
  async viewPassbook(userId, accountId, query, t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("get Passbook service started...");
      const user = await userConfig.model.findByPk(userId, { transaction: t });
      if (!user) {
        throw new NotFoundError(
          `User with id ${userId} has already been deleted or  does not exist.`
        );
      }
      const account = await accountConfig.model.findByPk(accountId, {
        transaction: t,
      });
      if (!account) {
        throw new NotFoundError(`account with id ${accountId} does not exist.`);
      }
      let selectArray = parseSelectFields(query, passbookConfig.fieldMapping);
      if (!selectArray) {
        selectArray = Object.values(accountConfig.fieldMapping);
      }

      const arg = {
        attributes: selectArray,
        ...parseLimitAndOffset(query),
        transaction: t,
        where: {
          accountId: accountId,
        },
      };

      const { count, rows } = await passbookConfig.model.findAndCountAll(arg);
      commit(t);
      Logger.info("get passbook service ended...");
      return { count, rows };
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }
}

module.exports = PassbookService;