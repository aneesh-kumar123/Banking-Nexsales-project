const { StatusCodes } = require("http-status-codes");
const BankAppError = require("./baseError");

class InvalidError extends BankAppError {
  constructor(specificMessage) {
    super(
      StatusCodes.BAD_REQUEST,
      specificMessage,
      "Invalid Error",
      "Invalid request"
    );
  }
}

module.exports = InvalidError;