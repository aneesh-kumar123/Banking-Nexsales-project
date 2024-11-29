const jwt = require("jsonwebtoken");
const Logger = require("../utils/logger");
const UnAuthorizedError = require("../errors/unauthorizedError");
const secreteKey = "aneesh@123";  //i will use dodenv after some time
const verifyAdmin = (req, res, next) => {
  try {
    Logger.info("verifying admin started...");
    console.log("cookies:", req.cookies["auth"]);
    console.log("Headers:",req.headers["auth"]);

    if (!req.cookies["auth"] && !req.headers["auth"]) {
      throw new UnAuthorizedError("Cookie Not Found...");
    }

    let token = req.headers["auth"].split(" ")[2];
    let payload = Payload.verifyToken(token);
    if (!payload.isAdmin) throw new UnAuthorizedError("Unauthorized access...");

    Logger.info("Verifying admin ended...");
    Logger.info("next called...");
    next();
  } catch (error) {
    next(error);
  }
};


const verifyUser = (req, res, next) => {
  try {
    Logger.info("Verifying user started...");
    console.log("cookie auth:",req.cookies["auth"])
    // console.log("header auth:",req.headers["auth"])


    if (!req.cookies["auth"] && !req.headers["auth"]  ) {
      throw new UnAuthorizedError("Cookie not found...");
    }

    // console.log("its ok")

    let token = req.headers["auth"].split(" ")[2];
    console.log("token is:=",token)
    let payload = Payload.verifyToken(token);
    if (payload.isAdmin)
      throw new UnAuthorizedError(
        "Admin can't do this operations , only users can do..."
      );
    const userId = req.params.userId;
    console.log("userId is:=",userId)
    console.log("payloadId is:=",payload.id)
    if (userId != payload.id) {
      throw new UnAuthorizedError(
        "You are not authorized to access this account..."
      );
    }

    Logger.info("Verifying ended...");
    Logger.info("next called");
    next();
  } catch (error) {
    next(error);
  }
};


const verifyUserID = (req, res, next) => {
  try {

    const { userId } = req.params;
    const id = req.userId;
    console.log("here", id);
    console.log("userId", userId);
    if (userId != id)
      throw new UnAuthorizedError(
        "You are not authorized to access this account..."
      );
    next();
  } catch (error) {
    next(error);
  }
};

const newPayload = (id, isAdmin) => {
  return Payload.newPayload(id, isAdmin);
};

class Payload {
  constructor(id, isAdmin) {
    this.id = id;
    this.isAdmin = isAdmin;
  }

  static newPayload(id, isAdmin) {
    try {
      return new Payload(id, isAdmin);
    } catch (error) {
      throw error;
    }
  }

  static verifyToken(token) {
    let payload = jwt.verify(token, secreteKey);
    return payload;
  }

  signPayload() {
    try {
      return `Bearer ${jwt.sign(
        {
          id: this.id,
          isAdmin: this.isAdmin,
        },
        secreteKey,
        { expiresIn: "10hr" }
      )}`;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = { newPayload, verifyAdmin, verifyUser,verifyUserID  };