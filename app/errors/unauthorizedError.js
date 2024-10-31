const BankAppError = require("./baseError");
const { StatusCodes } = require("http-status-codes");
class UnAuthorizedError extends BankAppError {
  constructor(specificMessage) {
    super(
      StatusCodes.UNAUTHORIZED,
      specificMessage,
      "UNAUTHORIZED",
      "UNAUTHORIZED Request"
    );
  }
}
module.exports = UnAuthorizedError;