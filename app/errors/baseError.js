class BankAppError extends Error {
  constructor(httpStatusCode, specificMessage, name, message) {
    super(message);
    (this.httpStatusCode = httpStatusCode),
      (this.specificMessage = specificMessage),
      (this.name = name);
  }
}
module.exports = BankAppError;