"use strict";

const getSocket = require("./getSocket");

module.exports = (socket_io, options) => {
  let socket = options?.socket;
  let fallback_socket = socket;
  let logger = options?.logger;
  return async (...args) => {
    if(fallback_socket?.connected !== true) {
      logger?.warn("Will be getting new fallback socket");
      //here catch is to avoid any unhandled promise rejection
      fallback_socket = (await getSocket(socket_io, {}).catch(() => {}))?.socket;
    }
    return fallback_socket?.originalEmit(...args);
  };
};