const uuid = require("uuid");

const createUUID = () => {
  return uuid.v4();
};

const validateUUID = (id) => {
  return uuid.validate(id);
};

module.exports = { createUUID, validateUUID };