const BankAppError = require("./baseError.js");
const { StatusCodes } = require("http-status-codes");
class badRequest extends BankAppError {
  constructor(specificMessage) {
    super(
      StatusCodes.BAD_REQUEST,
      specificMessage,
      "Bad Request",
      "Invalid Request"
    );
  }
}

module.exports = badRequest;