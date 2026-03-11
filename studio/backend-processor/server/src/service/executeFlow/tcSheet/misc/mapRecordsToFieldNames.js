"use strict";

const _ = require("lodash");
const utility = require("oute-services-utility-sdk");

const mapRecordsToFieldNames = async (records, field_mapping, options) => {
  records = records || [];
  field_mapping = field_mapping || {};
  if(_.isEmpty(field_mapping)) {
    return records;
  }
  const new_records = await utility.asyncMap({data: records, include_output: true}, async (record) => {
    record = record || {};
    const new_record = {};
    await utility.asyncMap({data: Object.keys(record)}, (key) => {
      const field_info = field_mapping[key];
      let new_key = key;
      if(field_info) {
        new_key = field_info.name || field_info?.display_name?.value;
        //as per the current request only mapping needs to be logged
        new_record[new_key] = record[key];
      } else if(options?.keep_unmapped === true) {
        new_record[key] = record[key];
      }
    });
    return new_record;
  });
  return new_records;
};

module.exports = mapRecordsToFieldNames;