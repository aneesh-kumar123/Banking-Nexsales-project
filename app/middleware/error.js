const BankAppError = require("../errors/baseError");

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof BankAppError) {
    console.log(err.specificMessage);
    return res.status(err.httpStatusCode).send(err.message);
  }
  res.status(500).send("Bad Request");
};
module.exports = errorMiddleware;