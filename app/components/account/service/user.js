const accountConfig = require("../../../model-config/account-config.js");
const userConfig = require("../../../model-config/user-config.js");
const bankConfig = require("../../../model-config/bank-config.js");
const ledgerConfig = require("../../../model-config/ledger-config.js")
const NotFoundError = require("../../../errors/notFoundError");
const Decimal = require("decimal.js");
const Logger = require("../../../utils/logger.js");
const { transaction, commit, rollBack } = require("../../../utils/transaction.js");
const { parseSelectFields, parseLimitAndOffset, parseFilterQueries, } = require("../../../utils/request");
const passbookConfig = require("../../../model-config/passbook-config");
const { createUUID } = require("../../../utils/uuid");
const badRequest = require("../../../errors/badRequest");

class AccountService {
  #associationMap = {
    passbook: {
      model: passbookConfig.model,
      required: true,
    },
  };

  #createAssociations(includeQuery) {
    const associations = [];

    if (!Array.isArray(includeQuery)) {
      includeQuery = [includeQuery];
    }
    if (includeQuery?.includes(accountConfig.association.passbook)) {
      associations.push(this.#associationMap.passbook);
    }
    return associations;
  }
  //create Account
  async createAccount(id, userId, bankId, accountType, t) {
    Logger.info("Create account service started...");
    if (!t) {
      t = await transaction();
    }
    try {

      Logger.info("create account service started...");
      const user = await userConfig.model.findOne({
        where: { id: userId },
        transaction: t,
      });

      if (user.dataValues.id != userId)
        throw new NotFoundError(`User with id ${userId} does not exists...`);

      const bank = await bankConfig.model.findOne({
        where: { id: bankId },
        transaction: t,
      });

      if (bank.dataValues.id != bankId)
        throw new NotFoundError(`Bank with id ${bankId} does not exists...`);
      const newAccount = await accountConfig.model.create(
        {
          id,
          userId,
          bankId,
          accountType,
          balance: 1000,
        },
        { transaction: t }
      );
      commit(t);
      Logger.info("Create account service ended...");
      return newAccount;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
      throw new Error("Failed to create account.");
    }
  }

  async getAllAccounts(userId, query, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get all accounts service started...");
      // console.log("user id is:",userId)
      let selectArray = parseSelectFields(query, accountConfig.fieldMapping);
      if (!selectArray) {
        selectArray = Object.values(accountConfig.fieldMapping);
      }

      const includeQuery = query.include || [];
      let association = [];
      if (includeQuery) {
        association = this.#createAssociations(includeQuery);
      }

      const filters = Object.keys(query || {}).length > 0
        ? parseFilterQueries(query, accountConfig.filters)
        : {};  // Only call parseFilterQueries if the query is not empty

      const arg = {
        attributes: selectArray,
        ...parseLimitAndOffset(query),
        transaction: t,
        where: {
          userId: userId,
          ...(filters.where || {}),
        },
        // ...parseFilterQueries(query, accountConfig.filters),
        include: association,
      };

      const { count, rows } = await accountConfig.model.findAndCountAll(arg);
      commit(t);
      Logger.info("get all accounts service ended...");
      return { count, rows };
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async getAccountById(userId, accountId, query, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get account by id service called...");
      let selectArray = parseSelectFields(query, accountConfig.fieldMapping);
      if (!selectArray) {
        selectArray = Object.values(accountConfig.fieldMapping);
      }

      const includeQuery = query.include || [];
      let association = [];
      if (includeQuery) {
        association = this.#createAssociations(includeQuery);
      }

      const arg = {
        attributes: selectArray,
        where: {
          userId: userId,
          id: accountId,
        },
        transaction: t,
        include: association,
      };

      const response = await accountConfig.model.findOne(arg);
      await commit(t);
      Logger.info("get account by id service ended...");
      return response;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async deleteAccountById(userId, accountId, t) {
    if (!t) {
      t = await transaction(t);
    }

    try {
      Logger.info("delete account by id service started...");
      const user = await userConfig.model.findByPk(userId, { transaction: t });

      if (!user) {
        throw new NotFoundError(
          `User with id ${userId} has already been deleted or  does not exist.`
        );
      }

      const rowsDeleted = await accountConfig.model.destroy(
        {
          where: { id: accountId },
        },
        { transaction: t }
      );
      console.log("the number of Row deleted:", rowsDeleted);

      if (rowsDeleted === 0)
        throw new NotFoundError(`Account with id ${accountId} does not exists`);

      await commit(t);
      Logger.info("delete account by id service ended...");
      return rowsDeleted;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async depositUserAccount(userId, accountId, amount, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("deposit user account service started...");
      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      const account = await accountConfig.model.findOne(
        {
          where: {
            id: accountId,
          },
        },
        { transaction: t }
      );
      if (!account) {
        throw new NotFoundError(`account with id ${accountId} does not exist.`);
      }
      const depositAmount = new Decimal(amount); 
      const currentBalance = new Decimal(account.balance); 

      // Update the balance
      const newBalance = currentBalance.plus(depositAmount); 

      // Save updated balance
      account.balance = newBalance.toFixed(2);
      
      await account.save({ transaction: t });

      Logger.info("create passbook entry started...");
    
      await this.#addPassbookEntry(
        createUUID(),
        accountId, "deposit",
        depositAmount.toFixed(2),
        newBalance.toFixed(2),
        t);
      await commit(t);
      Logger.info("create passbook entry ended...");

      Logger.info("deposit user account service ended...");
      return account;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async withDrawUserAccount(userId, accountId, amount, t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("Withdraw user account service started...");
      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      const account = await accountConfig.model.findOne(
        {
          where: {
            id: accountId,
          },
        },
        { transaction: t }
      );
      if (!account) {
        throw new NotFoundError(`account with id ${accountId} does not exist.`);
      }

      const withdrawAmount = new Decimal(amount); 
      const currentBalance = new Decimal(account.balance); 
      console.log("current Balance:", currentBalance)

      if (currentBalance.minus(withdrawAmount).lessThan(1000)) {
        throw new badRequest("Insufficient balance. Minimum balance of 1000 must be maintained.");
      }

      // Update the balance
      const newBalance = currentBalance.minus(withdrawAmount); 

      // Save updated balance
      account.balance = newBalance.toFixed(2);
     
      await account.save({ transaction: t });
      // const balance = account.balance;

      Logger.info("create passbook entry started...");
      
      await this.#addPassbookEntry(
        createUUID(),
        accountId, "withdraw",
        withdrawAmount.toFixed(2),
        newBalance.toFixed(2),
        t);
      await commit(t);
      Logger.info("create passbook entry ended...");

      Logger.info("withdraw  user account service ended...");
      return account;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async getBalanceUserAccount(userId, accountId, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get balance user account service called...");

      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      const account = await accountConfig.model.findOne(
        {
          where: {
            id: accountId,
          },
        },
        { transaction: t }
      );
      if (!account) {
        throw new NotFoundError(`account with id ${accountId} does not exist.`);
      }

      await commit(t);
      Logger.info("get balance user account service ended...");
      return account.balance;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async getTotalBalance(userId, bankId, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get total balance of user service started...");
      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      const bank = await bankConfig.model.findOne(
        {
          where: {
            id: bankId,
          },
        },
        { t }
      );
      if (!bank)
        throw new NotFoundError(`Bank with id ${bankId} does not exists...`);

      const totalBalance = await accountConfig.model.sum("balance", {
        where: {
          userId: userId,
          bankId: bankId,
        },
      });

      await commit(t);
      Logger.info("get total balance of user service ended...");
      return totalBalance;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  

  async transferBetweenUsers(
    senderUserId,
    receiverUserId,
    senderAccountId,
    receiverAccountId,
    amount,
    t
  ) {
    if (!t) t = await transaction();

    try {
      Logger.info("Transfer between users started...");
      console.log("senderuserId:",senderUserId)
      console.log("receiveruserId:",receiverUserId)
      console.log("senderAccountId:",senderAccountId)
      console.log("receiverAccountId:",receiverAccountId)

      // Fetch users
      const [senderUser, receiverUser] = await Promise.all([
        userConfig.model.findOne({
          where: {
            id: senderUserId,
          },
        }, { transaction: t }),
        userConfig.model.findOne({
          where: {
            id: receiverUserId,
          },
        }, { transaction: t }),
      ]);



      if (!senderUser || !receiverUser)
        throw new NotFoundError("One or both users do not exist.");

      // Fetch accounts
      const [senderAccount, receiverAccount] = await Promise.all([
        accountConfig.model.findOne({
          where: {
            id: senderAccountId,
          },
        }, { transaction: t }),
        accountConfig.model.findOne({
          where: {
            id: receiverAccountId,
          },
        }, { transaction: t }),
      ]);

      if (!senderAccount || !receiverAccount)
        throw new NotFoundError("One or both accounts do not exist.");

      const transferAmount = new Decimal(amount);
      const senderBalance = new Decimal(senderAccount.balance);

      // Ensure sufficient balance after transfer
      if (senderBalance.minus(transferAmount).lessThan(1000)) {
        throw new badRequest("Insufficient balance. Maintain a minimum of 1000.");
      }

      // Update balances
      senderAccount.balance = senderBalance.minus(transferAmount).toFixed(2);
      receiverAccount.balance = new Decimal(receiverAccount.balance)
        .plus(transferAmount)
        .toFixed(2);

      // Save the updated balances
      await Promise.all([
        senderAccount.save({ transaction: t }),
        receiverAccount.save({ transaction: t }),
      ]);

      // Add passbook entries
      await this.#addPassbookEntry(createUUID(),
        senderAccountId, "transfer-out", transferAmount.toFixed(2), senderAccount.balance, t
      );
      await this.#addPassbookEntry(
        createUUID(),
        receiverAccountId, "transfer-in", transferAmount.toFixed(2), receiverAccount.balance, t
      );

      // Add ledger entry if accounts belong to different banks
      if (senderAccount.bankId !== receiverAccount.bankId) {
        const [senderBank, receiverBank] = await Promise.all([
          bankConfig.model.findByPk(senderAccount.bankId, { transaction: t }),
          bankConfig.model.findByPk(receiverAccount.bankId, { transaction: t }),
        ]);

        console.log("the sender Bank is:",senderBank)
        console.log("the receiver Bank is:",receiverBank)
        console.log("the bank id is:",senderBank.id)
        console.log("the bank id is:",receiverBank.id)


        await this.ledgerEntry(
          senderBank.id, receiverBank.id, senderBank.bankName, receiverBank.bankName, amount, t
        );
      }

      await commit(t);
      Logger.info("Transfer between users completed successfully.");

      return {
        senderBalance: senderAccount.balance,
        receiverBalance: receiverAccount.balance,
      };
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
      throw error;
    }
  }




 

  async  ledgerEntry(senderBankId, receiverBankId, senderBankName, receiverBankName, amount, t) {
    if (!t) {
      t = await transaction();
    }
  
    try {
      Logger.info("Ledger entry service started...");
      console.log('Ledger entry data:', {
        senderBankId,
        receiverBankId,
        senderBankName,
        receiverBankName,
        amount,
      });
      
  
      //  sender to receiver transfer
      await ledgerConfig.model.create(
        {
          id: createUUID(), 
          senderBankId,
          receiverBankId,
          senderBankName,
          receiverBankName,
          totalAmount: -amount, 
          lastUpdated: new Date(),
        },
        { transaction: t }
      );
  
      //  (receiver to sender)
      await ledgerConfig.model.create(
        {
          id: createUUID(), 
          senderBankId: receiverBankId,
          receiverBankId: senderBankId,
          senderBankName: receiverBankName,
          receiverBankName: senderBankName,
          totalAmount: amount, 
          lastUpdated: new Date(),
        },
        { transaction: t }
      );
  
      await commit(t); 
      Logger.info("Ledger entry service ended successfully.");
    } catch (error) {
      await rollBack(t); 
      Logger.error(error);
      throw error; 
    }
  }
  

  
  


  async #addPassbookEntry(id, accountId, transactionType, amount, balanceAfter, t) {
    const passbookEntry = {
      id,
      accountId,
      transactionType,
      amount,
      balanceAfter,
    };
    await passbookConfig.model.create(passbookEntry, { transaction: t });
  }



}

module.exports = AccountService;