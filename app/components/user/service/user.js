const userConfig = require("../../../model-config/user-config.js");
const Logger = require("../../../utils/logger.js");
const bcrypt = require("bcrypt");
const NotFoundError = require("../../../errors/notFoundError.js");
const accountConfig = require("../../../model-config/account-config.js");
const {parseLimitAndOffset,parseFilterQueries,parseSelectFields,} = require("../../../utils/request.js");
const {transaction,rollBack, commit,} = require("../../../utils/transaction.js");

class UserService {
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
    if (includeQuery?.includes(userConfig.association.account)) {
      associations.push(this.#associationMap.account);
    }
    return associations;
  }

  async findUser(username, t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("Find user by username service started...");
      const user = await userConfig.model.findOne(
        {
          where: { username },
        },
        { t }
      );
      commit(t);
      Logger.info("Find user by username service started...");
      return user;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async createUser( id, firstName, lastName, username,password,age,isAdmin,t ) {
    Logger.info("create user service started...");
    if (!t) {
      t = await transaction();
    }

    try {
      let fullName = firstName + " " + lastName;

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(`password ${hashedPassword}`);
      let response = await userConfig.model.create(
        {
          id,
          firstName,
          lastName,
          fullName,
          username,
          password: hashedPassword,
          age,
          isAdmin,
        },
        { t }
      );
      commit(t);
      Logger.info("create user service ended...");
      return response;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  //getAllUsers
  async getAllUsers(query, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get all users service started...");
      let selectArray = parseSelectFields(query, userConfig.fieldMapping);
      if (!selectArray) {
        selectArray = Object.values(userConfig.fieldMapping);
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
        ...parseFilterQueries(query, userConfig.filters),
        include: association,
      };

      const { count, rows } = await userConfig.model.findAndCountAll(arg);
      commit(t);
      Logger.info("get all users service ended...");
      return { count, rows };
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async getUserById(userId, query, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get user by id service called...");
      let selectArray = parseSelectFields(query, userConfig.fieldMapping);
      if (!selectArray) {
        selectArray = Object.values(userConfig.fieldMapping);
      }

      const includeQuery = query.include || [];
      let association = [];
      if (includeQuery) {
        association = this.#createAssociations(includeQuery);
      }

      const arg = {
        attributes: selectArray,
        where: {
          id: userId,
        },
        transaction: t,
        include: association,
      };

      const response = await userConfig.model.findOne(arg);
      await commit(t);
      Logger.info("get user by id service ended...");
      return response;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async updateUserById(userId, parameter, value, t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("update user by id service called...");

      const user = await userConfig.model.findByPk(userId, { transaction: t });

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      user[parameter] = value;

      await user.save({ transaction: t });

      commit(t);
      Logger.info("update user by id service ended...");
      return user;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
      throw error;
    }
  }

  async deleteUserById(userId, t) {
    if (!t) {
      t = await transaction(t);
    }

    try {
      Logger.info("delete user by id service started...");

      const rowsDeleted = await userConfig.model.destroy({
        where: { id: userId },
        transaction: t,
      });

      if (rowsDeleted === 0)
        throw new NotFoundError(`User with id ${userId} does not exists...`);

      await commit(t);
      Logger.info("delete user by id service ended...");
      return rowsDeleted;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }
}

module.exports = UserService;