"use strict"

let connect = require("./connect");
let executeFlow = require("./executeFlow");
let executeNode = require("./executeNode");

module.exports = (socket)=> {
  connect(socket);
  socket?.on("execute_flow", executeFlow(socket));
  socket?.on("execute_node", executeNode(socket));
}