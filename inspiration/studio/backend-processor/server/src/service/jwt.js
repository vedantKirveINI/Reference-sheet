"use strict";

let _ = require("lodash");
let jwt = require('jsonwebtoken');

let constants = require("../../config/conf").stores["constants"];

module.exports.generateJWTToken = (data, secret, options, callback) => {
  if (!(secret)) {
    secret = constants.get("jwt")?.jwt_secret;
  }
  if (_.isEmpty(options) || !(options)) {
    options = { expiresIn: constants.get("jwt")?.expiry };
  }
  return jwt.sign(data, secret, options, (error, token) => {
    if (error) { return callback(error); }
    return callback(null, token);
  });
};

module.exports.verifyToken = (token, secret, options, callback) => {
  if (!(secret)) {
    secret = constants.get("jwt")?.jwt_secret;
  }
  if ((_.isEmpty(options) || !(options))) {
    options = {};
  }
  //We are depricating the secret provided, and overiding by alg
  let unverified_decoded = jwt.decode(token, { complete: true });
  let jwt_header = unverified_decoded?.header;
  if (jwt_header?.alg?.startsWith("HS")) {
    secret = constants.get("jwt")?.app_password;
  } else if (jwt_header?.alg?.startsWith("RS")) {
    secret = constants.get("jwt")?.jwt_secret;
  }
  return jwt.verify(token, secret, options, (error, decoded) => {
    if (error) { return callback({ message: "request not authorized", error }); }
    if (decoded?.sub){
      decoded.user_id = decoded?.sub;
    }
    if (!(decoded?.user_id)){
      decoded.user_id = `anonymous_${new Date().getTime()}`;
    }
    return callback(null, decoded);
  });
};