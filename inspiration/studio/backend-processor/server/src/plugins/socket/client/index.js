"use strict";

let {
  io
} = require("socket.io-client");
const {getDateInstance} = require("oute-services-utility-sdk");
const date_instance = getDateInstance();
let conf = require("../../../../config/conf");
let eventHandler = require("./eventHandler");
let config = conf.stores["config"]?.store;
let constants = conf.stores["constants"]?.store;
let logger = conf.stores["logger"]?.store;

let __SLEEP__ = 0;
let __SLEEP_INTERVAL__ = 10000;
let __MAX_SLEEP__ = 120000;
let lsd = new Date();
let should_call_connect = true;

let socket_opt = {
  reconnectionDelay: 5000,
  transports: ["websocket", "webtransport", "polling"],
  query: {
    token: config?.token,
    room_id: config?._id,
    room_type: "DEPLOYMENT"
  }
};
let socket = undefined;

module.exports = {
  getSocket: () => {
    if (!socket) {
      logger.info("Socket not initialized");
    }
    return socket;
  },

  init: () => {
    if([false, "false"].includes(config?.enable_activity)) {
      logger.info("MONITORING IS DISABLED");
      return;
    }
    if(socket === undefined) {
      socket = io(constants?.deployment?.url, socket_opt);
    }
    eventHandler(socket);
    setInterval((() => {
      if(socket?.connected === true) {
        return socket.emit("heartbeat", {message: "heartbeat"});
      }
    }
    ), constants?.socket?.client?.heartbeat_ms);
    socket.on("connect_error", error => {
      logger.error(error);
      if(["MISSING_TOKEN", "INVALID_TOKEN"].includes(error?.message)) {
        __SLEEP__ = __MAX_SLEEP__;
        lsd = new Date();
        return;
      }
      if(should_call_connect === true) {
        __SLEEP__ = __SLEEP__ + __SLEEP_INTERVAL__;
        if(__SLEEP__ > __MAX_SLEEP__) {
          __SLEEP__ = __SLEEP_INTERVAL__;
        }
        should_call_connect = false;
        return setTimeout((() => {
          logger.info(`we are tring to connect socket after ${__SLEEP__} ms, last check was [${lsd}]`);
          socket.connect();
          lsd = new Date();
          should_call_connect = true;
        }
        ), __SLEEP__);
      } else {
        if((date_instance().diff(date_instance(lsd), "minutes") > (__MAX_SLEEP__ * 5)) && (should_call_connect === false)) {
          return should_call_connect = true;
        }
      }
    });
  }
};