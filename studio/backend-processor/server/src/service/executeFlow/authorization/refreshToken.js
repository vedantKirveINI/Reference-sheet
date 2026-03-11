"use strict";

const _ = require("lodash");
const utility_instance = require("oute-services-utility-sdk");
const AuthorizedData = require("oute-services-authorized-data-sdk");

const conf = require("../../../../config/conf");

const constants = conf.stores["constants"]?.store;

const date_instance = utility_instance.getDateInstance();
const auth_data_instance = new AuthorizedData({ url: constants?.heimdall?.url, token: constants?.mw_token });

module.exports = async(params) => {
  const body = _.cloneDeep(params?.body || {});
  let auth_data = body?.auth_data || {};
  let auth_config = body?.auth_config || {};
  if (auth_data?._id && !auth_data?.id) {
    auth_data.id = auth_data?._id;
  }
  let auth_data_id = auth_data?.id;
  let is_token_expired = false;
  //check for auth token expiry
  if (date_instance(auth_data?.expire_at).diff(date_instance(), "seconds") < 120){
    //get the old config from db
    if (auth_data_id) {
      let db_auth_data = (await auth_data_instance.findOne({ _id: auth_data_id }))?.result;
      if (date_instance(db_auth_data?.configs?.expire_at).diff(date_instance(), "seconds") < 120) {
        is_token_expired = true;
      }
      auth_data = _.extend(auth_data, db_auth_data?.configs);
    } else {
      is_token_expired = true;
    }
  }
  if (is_token_expired === true && auth_config?.token_uri && auth_data?.refresh_token) {
    let get_token_options = {
      method: "POST",
      url: auth_config?.token_uri,
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body: {
        client_id: auth_config?.client_id,
        client_secret: auth_config?.client_secret,
        grant_type: "refresh_token",
        refresh_token: auth_data?.refresh_token
      },
      body_info: {
        type: "x-www-form-urlencoded"
      }
    };
    const app_type = String(auth_config?.app_type).toLowerCase();
    if(["reddit", "notion", "gong"].includes(app_type)) {
      get_token_options.headers.Authorization = `Basic ${Buffer.from(`${auth_config?.client_id}:${auth_config?.client_secret}`).toString("base64")}`;
      delete get_token_options.body.client_id;
      delete get_token_options.body.client_secret;
    }
    let get_token_resp = await utility_instance.executeAPI(get_token_options);
    if ([200, 201].includes(get_token_resp?.status_code) && !(get_token_resp?.result?.error)) {
      const { id, ...rest } = get_token_resp.result || {};
      const extra = {id};
      auth_data = {...auth_data, ...rest, extra};
      auth_data.expire_at = date_instance().add((parseInt(auth_data?.expires_in) || 0), "seconds").toDate();
      //update the auth data with new token info
      if(auth_data_id) {
        await auth_data_instance.save({ _id: auth_data_id, configs: auth_data, deep_extend: true });
      }
    } else {
      throw get_token_resp?.result || get_token_resp;
    }
  }
  return {auth_data};
};