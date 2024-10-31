const BankAppError = require("./baseError");
const { StatusCodes } = require("http-status-codes");
class NotFoundError extends BankAppError {
  constructor(specificMessage) {
    super(
      StatusCodes.NOT_FOUND,
      specificMessage,
      "Not Found",
      "Not Found Request"
    );
  }
}
module.exports = NotFoundError;