"use strict";

module.exports = socket => {
  try {
    //Add the socket on room
    socket.join(socket?.handshake?.decoded?.user_id);
  } catch (error) {
    console.error("ON-SOCKET-CONNECT-ERROR", error);
    return;
  }
}