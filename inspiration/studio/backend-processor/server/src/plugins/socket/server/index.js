"use strict";

const socket_io = require("socket.io");
const { createAdapter } = require("@socket.io/redis-streams-adapter");
const logger_instance = require("oute-services-logger-sdk");

const conf = require("../../../../config/conf");
const DbManager = require("../../../dataStore/redisDbHandler");
let constants = conf.stores["constants"]?.store;
let config = conf.stores["config"];
let logger = conf.stores["logger"]?.store;

const eventHandler = require("./eventHandler");
const safeEmit = require("../safeEmit");
const verifyToken = require("../../../service/jwt")?.verifyToken;
const socket_config = constants?.socket?.server;
const socket_opt = socket_config?.options;
const db_instance = new DbManager({db_index: socket_config?.redis_db_index, ignore_error: true});
let io = undefined;

let authHandler = (socket, next) => {
  let token = socket?.handshake?.query?.token;
  if (["", null, undefined, "undefined", "null"].includes(token)) {
    socket.disconnect(true);
    return next(new Error("MISSING_TOKEN"));
  }
  return verifyToken(token, config.get("jwt")?.app_password, { ignoreExpiration: true }, (error, decoded) => {
    if (error) {
      socket.disconnect(true);
      return next(new Error("INVALID_TOKEN"));
    }
    socket.handshake.decoded = decoded;
    return next();
  });
};

module.exports = {
  getIO: () => {
    if (!(io)) {
      logger.info("IO not initialized");
    }
    return io;
  },

  init: async (server) => {
    if(!logger)
      logger = conf.stores["logger"]?.store;
    if (io) {
      return io;
    } else {
      logger.info("Initializing socket server");
      const pub_client = await db_instance.getClient();
      if(pub_client?.disabled === true) {
        logger.warn("Socket will work with in-memory adapter");
        logger.warn(pub_client);
      } else {
        logger.info("Socket will work with redis adapter");
        socket_opt.adapter = createAdapter(pub_client, {streamName: "socket_io"});
      }
      io = socket_io(server, socket_opt);
      io.use(logger_instance.socketIOLoggingMiddleware({logger}));
      io.use(authHandler);
      io.on("connection", socket => {
        socket.originalEmit = socket.emit.bind(socket);
        socket.emit = safeEmit(io, {socket, logger});
        return eventHandler(socket);
      });
      return io;
    }
  }
};