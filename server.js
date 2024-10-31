const express = require("express");
const application = express();
const cors = require("cors");
const routeConfig = require("./app/config/route-config.js");
const cookieParser = require("cookie-parser");

function configureApplication(app) {
  app.use(cors());
  app.use((req, res, next) => {
    res.set("Access-Control-Allow-Origin", "*");

    res.set(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  app.use(cookieParser());
  app.use(express.json());
}

function configureRoutes(app) {
  routeConfig.registerRoutes(app);
}

function configureErrorHandler(app) {
  app.use((req, res, next) => {
    next(new errors.NotFound(errorMessages.ERR_API_NOT_FOUND));
  });

  app.use((_err, req, res, _) => {
    const err = _err;

    if (err) {
      console.log(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Error for Request<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
      );
      console.log(`requested API : ${req.url}`);
      console.log(`method : ${req.method}`);
      console.log("request body : ");
      // console.log(
      //   util.inspect(req.body, {
      //     showHidden: false,
      //     depth: 2,
      //     breakLength: Infinity,
      //   }),
      // );
      console.log(
        `request Authorization  header:  ${req.get("Authorization")}`
      );
      console.log(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Error stack<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
      );
      console.log(err);
      console.log(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>End of error<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
      );
      const errorStatusCode =
        err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR;
      const errorJson = {
        message: err.message,
      };

      if (settingsConfig.settings.environment === "local") {
        // deletes the stack if it is prod or beta environment.
        // As stack is just for local purpose.
        errorJson.stack = err.stack;
      }
      res.status(errorStatusCode).json(errorJson);
    }
  });
}

function startServer(app) {
  app.listen(5000, () => {
    console.log("Started At 5000");
  });
}
function configureWorker(app) {
  configureApplication(app);
  configureRoutes(app);
  configureErrorHandler(app);
  startServer(app);
}

configureWorker(application);