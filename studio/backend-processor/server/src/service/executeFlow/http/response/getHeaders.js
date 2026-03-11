"use strict";

/*
  This function convert response headers as json object
*/

module.exports = response => {
  let result = {};
  response?.headers?.forEach((value, key) => {
    return result[key] = value;
  });
  return result;
};