const bankConfig = require("../../../model-config/bank-config.js");
const accountConfig = require("../../../model-config/account-config.js");
const Logger = require("../../../utils/logger.js");
const { transaction, rollBack, commit,} = require("../../../utils/transaction.js");
const NotFoundError = require("../../../errors/notFoundError.js");
const {parseSelectFields, parseLimitAndOffset, parseFilterQueries,} = require("../../../utils/request.js");
const badRequest = require("../../../errors/badRequest.js");


class BankService {
  #associationMap = {
    account: {
      model: accountConfig.model,
      required: true,
    },
  };

  #createAssociations(includeQuery) {
    const associations = [];

    if (!Array.isArray(includeQuery)) {
      includeQuery = [includeQuery];
    }
    if (includeQuery?.includes(bankConfig.association.account)) {
      associations.push(this.#associationMap.account);
    }
    return associations;
  }


  async createBank(id, bankName, abbreviation, t) {
    Logger.info("Create bank service started...");

    if (!t) {
      t = await transaction();
    }

    try {
      const response = await bankConfig.model.create(
        {
          id,
          bankName,
          abbreviation,
        },
        { transaction: t }
      );

      commit(t);
      Logger.info("Create bank service ended...");
      return response;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
      throw new Error("Error creating bank.");
    }
  }

  async getAllBanks(query, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get all banks service started...");
      let selectArray = parseSelectFields(query, bankConfig.fieldMapping);
      if (!selectArray) {
        selectArray = Object.values(bankConfig.fieldMapping);
      }

      const includeQuery = query.include || [];
      let association = [];
      if (includeQuery) {
        association = this.#createAssociations(includeQuery);
      }

      const arg = {
        attributes: selectArray,
        ...parseLimitAndOffset(query),
        transaction: t,
        ...parseFilterQueries(query, bankConfig.filters),
        include: association,
      };

      const { count, rows } = await bankConfig.model.findAndCountAll(arg);
      commit(t);
      Logger.info("get all banks service ended...");
      return { count, rows };
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async getBankById(bankId, query, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get bank by id service called...");
      let selectArray = parseSelectFields(query, bankConfig.fieldMapping);
      if (!selectArray) {
        selectArray = Object.values(bankConfig.fieldMapping);
      }

      const includeQuery = query.include || [];
      let association = [];
      if (includeQuery) {
        association = this.#createAssociations(includeQuery);
      }

      const arg = {
        attributes: selectArray,
        where: {
          id: bankId,
        },
        transaction: t,
        include: association,
      };

      const response = await bankConfig.model.findOne(arg);
      await commit(t);
      Logger.info("get bank by service ended...");
      return response;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async updateBankById(bankId, parameter, value, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("update bank by id service called...");
      const bank = await bankConfig.model.findByPk(bankId, { transaction: t });
      if (!bank)
        throw new NotFoundError(`Bank with id ${bankId} does not exists...`);

      bank[parameter] = value;
      await bank.save({ transaction: t });

      commit(t);
      Logger.info("update bank by id service ended...");
      return bank;
    } catch (error) {
      Logger.error(error);
    }
  }

  async deleteBankById(bankId, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("delete bank service started...");

      const totalAccounts = await accountConfig.model.count(
        {
          where: {
            bankId: bankId,
          },
        },
        {
          transaction: t,
        }
      );
      if (totalAccounts > 0)
        throw new badRequest(
          "Cannot delete bank since there exists accounts in this bank..."
        );

      const deletedBank = await bankConfig.model.destroy(
        {
          where: {
            id: bankId,
          },
        },
        {
          transaction: t,
        }
      );

      if (deletedBank === 0)
        throw new NotFoundError(`Bank with id : ${bankId} does not exists...`);

      await commit(t);
      Logger.info("delete bank service ended...");
      return deletedBank;
    } catch (error) {}
  }
}

module.exports = BankService;
