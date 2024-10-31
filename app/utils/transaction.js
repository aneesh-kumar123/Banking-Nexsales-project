const db = require("../../models");

const transaction = async () => {
  return await db.sequelize.transaction();
};

const rollBack = async (transactionObj) => {
  return await transactionObj.rollback();
};

const commit = async (transactionObj) => {
  return await transactionObj.commit();
};

module.exports = { transaction, rollBack, commit };