(async () => {
  //
  // Module dependencies.
  //
  //This should be at the top to load the env
  require('dotenv').config();
  let conf = require("../config/conf");
  let process = require("process");
  let constants = conf.stores["constants"];
  if([true, "true"].includes(constants.get("enable_apm"))) {
    if(constants.get("apm_provider") === "newrelic") {
      //This is the lib imported here not the config file
      process.env.NEW_RELIC_HOME = `${__dirname}/newrelic.js`;
      require("newrelic");
    }
  }
  let express = require("express");
  let logger_instance = require("oute-services-logger-sdk");
  let path = require("path");
  let cors = require("cors");
  let http = require("http");
  let compression = require("compression");
  const helmet = require("helmet");
  let serverless = require("serverless-http");

  let app = express();
  let server = http.createServer(app);

  let app_id = constants.get("app_id");
  //initialized the logger on top to get have access to sub modules
  //Note keep this at top
  let logger_config = { winston_config: { defaultMeta: { service: app_id }, transports: [], silent: false } };
  if ([false, "false"].includes(constants.get("enable_local_logging"))) {
    logger_config.log_locally = false;
  }
  //suppress the logs if cloud & local both is disabled
  if([true, "true"].includes(constants.get("enable_apm")) && [false, "false"].includes(constants.get("enable_local_logging"))) {
    logger_config.winston_config.silent = true;
  }
  //To set the logging level from env
  let log_level = constants.get("log_level")?.trim();
  if(log_level && !["all"].includes(log_level)) {
    logger_config.winston_config.level = log_level;
  }

  //To set the local logging level from env
  let local_log_level = constants.get("local_log_level")?.trim();
  if(local_log_level && !["all"].includes(local_log_level)) {
    logger_config.local_log_level = local_log_level;
  }

  let logger = logger_instance.getLoggerInstance(logger_config);
  //This middleware use to manage the unique log id for complete request
  app.use(logger_instance.expressLoggingMiddleware);
  //This middleware will log the requests
  if(["true", true].includes(constants.get("enable_req_logging"))) {
    let req_logging_opt = { logger: logger };
    let excluded_urls = constants.get("newrelic")?.excluded_urls;
    if (excluded_urls?.length) {
      excluded_urls = [{ reg_exp: excluded_urls.join("|"), reg_option: "g" }];
      req_logging_opt.excluded_urls = excluded_urls;
    }
    app.use(logger_instance.requestLogger(req_logging_opt));
  }
  //Storing the logger as globaly to access at different locations
  conf.add("logger", { type: 'literal', store: logger });

  //imported the socket to get connected with the server
  let socket_instance = require("./plugins/socket");
  let server_instance = socket_instance?.server_instance;
  let client_instance = socket_instance?.client_instance;
  await server_instance.init(server);
  client_instance.init();

  let initFn = require("./init");

  app.set("views", __dirname + "/views");
  app.set("view engine", "html");

  //cors setup
  const cors_options = {
    credentials: true,
    origin: (origin, callback) =>{
      return callback(null, true);
    }
  };
  app.use(cors(cors_options));
  //compression - there is special option to filter request which dont need compression
  // eg. app.use(compression({ filter: shouldCompress }))
  app.use(compression());
  //security headers
  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: { directives: { styleSrc: ["'self'"] } }}));
  //For addtional requirement with manually
  const allowed_to_expose_headers = "Authorization, X-Request-ID, X-RateLimit-Limit, X-RateLimit-Remaining, Content-Disposition, Location, auth, token";
  app.use((req, res, next) =>{
    //set permissions header
    res.setHeader("Permissions-Policy", "interest-cohort=()");
    //this will used to expose the headers to the client
    res.setHeader('Access-Control-Expose-Headers', allowed_to_expose_headers);
    return next();
  });
  app.set('trust proxy', 1);

  //This block will help in gracefully stopping the service
  const shutdown = async() => {
    const logger = conf.stores["logger"]?.store;
    if(logger){
      logger.info("Service stopped gracefully");
    } else {
      console.log("Service stopped gracefully");
    }
    process.exit(0);
  };
  ["SIGINT", "SIGTERM", "SIGQUIT", "SIGHUP"].forEach((signal) => {process.on(signal, shutdown);});
  ["uncaughtException", "unhandledRejection"].forEach((signal) =>{
    process.on(signal, async(error, source) => {
      const logger = conf.stores["logger"]?.store;
      if(logger){
        logger.error({type: signal, error: error?.stack || error, source});
      } else {
        console.error({type: signal, error: error?.stack || error, source});
      }
      await shutdown();
    });
  });

  let printArt = function () {
    return conf.get("version");
  };

  try {
    let INIT_CALLED = false;
    app.get("/", (req, res) => {return res.sendFile(path.join(__dirname, "public", "index.html"));});
    //Handles post requests, body parsing
    app.use(express.json({ limit: constants.get("max_body_size"), extended: true }));
    app.use(express.urlencoded({ limit: constants.get("max_body_size"), extended: true }));
    app.use(express.text({ limit: constants.get("max_body_size"), extended: true }));
    if (process?.env?.APP_MODE === "serverless") {
      let provider = process?.env?.APP_PROVIDER || "aws";
      let handler = serverless(server, { provider });
      //note for aws args can be event, context and for azure args can be context, req
      module.exports.handler = async (...args) => {
        if (INIT_CALLED === false) {
          await initFn(app);
          INIT_CALLED = true;
        }
        return handler(...args);
      };
      console.info(`${app_id} instance listening as serverless in ${conf.get("NODE_ENV")} mode`);
    } else {
      await initFn(app);
      INIT_CALLED = true;
      server.listen(conf.get("port"), function () {
        printArt();
        console.info(`${app_id} instance listening on port ${conf.get("port")} in ${conf.get("NODE_ENV")} mode`);
        return;
      });
    }
  } catch (error) {
    logger.error(error);
    process.exit();
  }
})();