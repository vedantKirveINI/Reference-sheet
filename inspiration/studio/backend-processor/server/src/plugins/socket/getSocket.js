"use strict";

const utility = require("oute-services-utility-sdk");
const conf = require("../../../config/conf");
let logger = conf.stores["logger"]?.store;

const filterFn = (socket) => {
  const query = socket?.handshake?.query;
  if(socket?.connected === true && query?.room_type?.toUpperCase() === "PROCESSOR" && query?.room_id?.toUpperCase() === "IC") {
    return true;
  } else {
    return false;
  }
};

module.exports = async (socket_io, options) => {
  if(!logger) { logger = conf.stores["logger"]?.store; }
  const result = {};
  const filterFunc = options?.filter || filterFn;
  const socket_id = options?.socket_id;
  const sockets = socket_io?.sockets?.sockets;
  if(sockets?.size) {
    if(socket_id) {
      result.socket = sockets?.get(socket_id);
    }
    if(!result.socket) {
      const valid_sockets = [];
      await utility.asyncMap({data: Array.from(sockets.values())}, (socket) => {
        if(filterFunc(socket) === true) {
          valid_sockets.push(socket);
        }
      });
      if(valid_sockets.length) {
        result.socket = valid_sockets[0];
      }
    }
  }
  //if no socket matches then use custom emitter
  if(!result.socket) {
    logger?.warn("Using custom socket emitter");
    result.socket = {
      emit: (...args) => {
        if(!socket_io || !options?.socket_id) {
          logger?.warn("No socket found to emit");
          return;
        }
        socket_io?.to(options?.socket_id)?.emit(...args);
        return;
      }
    };
  }
  return result;
};