"use strict";

const _ = require("lodash");

const buildSelectedAttributes = (inputs) => {
  const attributes = [];
  if (_.isArray(inputs) && inputs.length > 0) {
    for (let input of inputs) {
      if(!["", null, undefined].includes(input?.key)) {
        attributes.push({id: input?.key});
      }
    }
  }
  return attributes;
};

module.exports = buildSelectedAttributes;