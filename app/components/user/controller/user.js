const { HttpStatusCode } = require("axios");
const UserService = require("../service/user");
const { createUUID, validateUUID } = require("../../../utils/uuid.js");
const { setXTotalCountHeader } = require("../../../utils/response.js");
const Logger = require("../../../utils/logger.js");
const badRequest = require("../../../errors/badRequest.js");
const bcrypt = require("bcrypt");

const {
  validateFirstName,
  validateLastName,
  validateAge,
  validateParameter
} = require("../../../utils/validations.js");
const { newPayload } = require("../../../middleware/authService.js");

class UserController {
  constructor() {
    this.userService = new UserService();
  }
  //login operation
  async login(req, res, next) {
    try {
      Logger.info("Login controller started");
      const { username, password } = req.body;
      if (typeof username != "string")
        throw new badRequest("invalid username type");
      if (typeof password != "string")
        throw new badRequest("invalid password type");
      // validateUUID(userId);

      const user = await this.userService.findUser(username);
      if (!user) throw new NotFoundError("user does not exists...");

      if (await bcrypt.compare(password, user.password)) {
        let payload = newPayload(user.id, user.isAdmin);
        // console.log("user id is",user.id)
        let token = payload.signPayload();
        res.cookie("auth", `Bearer ${token}`);

        res.set("auth", `Bearer ${token}`);
        res.status(200).send(token);
      } else {
        res.status(403).json({
          message: "password incorrect",
        });
      }
      Logger.info("Login controller ended...");
    } catch (error) {
      next(error);
    }
  }

  //create Admin
  async createAdmin(req, res, next) {
    try {
      Logger.info("Create user controller started...");
      const { firstName, lastName, username, password, age } = req.body;
      validateFirstName(firstName);
      validateLastName(lastName);
      validateAge(age);
      if (firstName === lastName)
        throw new badRequest("first name and last name cannot be same...");
      if (typeof username != "string")
        throw new badRequest("invalid username type");
      if (typeof password != "string")
        throw new badRequest("invalid password type");

      let response = await this.userService.createUser(
        createUUID(),
        firstName,
        lastName,
        username,
        password,
        age,
        true
      );
      Logger.info("Create user controller ended...");
      res.status(HttpStatusCode.Created).json(response);
    } catch (error) {
      next(error);
    }
  }

  //create user
  async createUser(req, res, next) {
    try {
      Logger.info("Create user controller started...");

      const { firstName, lastName, age, username, password } = req.body;
      validateFirstName(firstName);
      validateLastName(lastName);
      validateAge(age);
      if (typeof username != "string")
        throw new badRequest("invalid username type");
      if (typeof password != "string")
        throw new badRequest("invalid password type");

      let response = await this.userService.createUser(
        createUUID(),
        firstName,
        lastName,
        username,
        password,
        age,
        false
      );
      Logger.info("Create user controller ended...");
      res.status(HttpStatusCode.Created).json(response);
    } catch (error) {
      next(error);
    }
  }

  //getAllUser
  async getAllUsers(req, res, next) {
    try {
      Logger.info("getAll users controller called...");
      const { count, rows } = await this.userService.getAllUsers(req.query);
      setXTotalCountHeader(res, count);
      res.status(HttpStatusCode.Ok).json(rows);
    } catch (error) {
      next(error);
    }
  }

  //getUserById
  async getUserById(req, res, next) {
    try {
      Logger.info("get user by id controller called...");
      const { userId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }

      const response = await this.userService.getUserById(userId, req.query);
      Logger.info("get user by id controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateUserById(req, res, next) {
    try {
      Logger.info("update user by id controller called...");
      const { userId } = req.params;
      const { parameter, value } = req.body;
      // if (typeof parameter != "string")
      //   throw new badRequest("invalid parameter type....");
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      // console.log("the value is",validateParameter(parameter))

      // if(!validateParameter(parameter))
      // {console.log("parameter is",parameter)
      //   throw new Error("invalid parameter....");
      // }
      validateParameter(parameter)
      

      const response = await this.userService.updateUserById(
        userId,
        parameter,
        value
      );
      if (!response)
        throw new NotFoundError("user not found or user updation failed....");
      res
        .status(HttpStatusCode.Ok)
        .json({ message: `User with id ${userId} is updated successfully` });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserById(req, res, next) {
    try {
      Logger.info("delete user by id controller started...");
      const { userId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }

      const response = await this.userService.deleteUserById(userId);
      if (!response)
        throw new NotFoundError("user not found or deletion failed...");
      res
        .status(HttpStatusCode.Ok)
        .json({ message: `User with id ${userId} is deleted successfully` });
    } catch (error) {
      next(error);
    }
  }
}

const userController = new UserController();
module.exports = userController;