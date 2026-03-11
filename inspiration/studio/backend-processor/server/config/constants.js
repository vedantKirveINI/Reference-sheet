"use strict";

const process = require("process");
const env_var = process?.env;

const max_body_size_mb = 200;

module.exports = {
  app_id: "processor-api",
  max_body_size: `${max_body_size_mb}mb`,
  redis_conn_string: env_var?.REDIS_CONN_STRING,
  enable_internal_api: env_var?.ENABLE_INTERNAL_API,
  apm_provider: env_var?.APM_PROVIDER,
  logging_provider: env_var?.LOGGING_PROVIDER,
  enable_req_logging: env_var?.ENABLE_REQ_LOGGING,
  enable_apm: env_var?.ENABLE_APM,
  enable_cloud_logging: env_var?.ENABLE_CLOUD_LOGGING,
  enable_local_logging: env_var?.ENABLE_LOCAL_LOGGING,
  log_level: env_var?.LOG_LEVEL,
  local_log_level: env_var?.LOCAL_LOG_LEVEL,
  redis_db_index: env_var?.REDIS_DB_INDEX,
  newrelic: {
    apm_secret: env_var?.APM_SECRET,
    excluded_urls: [
      "^/$|^/health$|^/public|^/favicon.ico|^/static|^/metrics",
      "^/socket.io/.*/xhr-polling/"
    ],
  },
  deployment: {
    url: env_var?.IC_BACKEND_URL,
    auth: "jwt",
    find_one_published: "/service/public/v0/canvas/published/find/one",
    find_one_published_by_asset: "/service/public/v0/canvas/published/by/asset"
  },
  gpt: {
    url: env_var?.GPT_BACKEND_URL,
    chat_path: "/chatgpt",
    researcher_path: "/researcherGpt",
    writer_path: "/writerGpt",
    auth: "jwt"
  },
  heimdall: {
    url: env_var?.HEIMDALL_BACKEND_URL
  },
  sheet_bff: {
    url: env_var?.SHEET_BACKEND_URL,
    insert_record_sub_sheet: "/record/create_record",
    insert_record_sub_sheet_v2: "/record/v2/create_record",
    find_one_record_sub_sheet: "/record/get_record",
    find_one_record_sub_sheet_v2: "/record/v2/get_record",
    find_record_sub_sheet: "/record/get_records",
    find_record_sub_sheet_v2: "/record/v2/get_records",
    update_record_sub_sheet: "/record/update_records_by_filters",
    update_record_sub_sheet_v2: "/record/v2/update_records_by_filters",
    // delete_record_sub_sheet: "/record/update_records_by_filters",
    delete_record_sub_sheet: "/record/v2/update_records_by_filters",//this switch because above one not needed now
    auth: "jwt"
  },
  tc_agent_backend: {
    url: env_var?.TC_AGENT_BACKEND_URL,
    sout_path: "/api/tinyscout",
    composer_path: "/api/tiny/composer",
    search_path: "/api/tinysearch"
  },
  hooknrun: {
    url: env_var?.HOOKNRUN_BACKEND_URL,
  },
  intervene: {
    url: env_var?.INTERVENE_BACKEND_URL,
    create_task_path: "/hitl/task"
  },
  unwanted_keys: ["key_config", "task_obj", "__h_meta", "__h_result"],
  socket: {
    server: {
      redis_db_index: env_var?.REDIS_SOCKET_DB_INDEX,
      options: {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        },
        maxHttpBufferSize: max_body_size_mb * 1000000,
        connectionStateRecovery: {
          maxDisconnectionDuration: 2 * 60 * 1000
        }
      }
    },
    client: {
      heartbeat_ms: 900000
    }
  },
  jwt: {
    jwt_secret: env_var?.JWT_SECRET,
    expiry: "999 years",
    app_id: "digihealth-admin-token-creator",
    app_password: "hockeystick"
  },
  mw_token: env_var?.MW_TOKEN,
  buddy: {
    url: env_var?.BUDDY_BACKEND_URL,
    agent_chat_path: "/api/chat/execute"
  },
  mailer: {
    url: env_var?.MAILER_BACKEND_URL,
    ses_send_path: "/service/v0/mailer/ses/send",
    default_from_email: "TinyCommand<notifications@tinycommand.com>"
  },
  tc_enrich_backend: {
    url: env_var?.TC_ENRICH_BACKEND_URL,
    person_path: "/api/realtime/person",
    company_path: "/api/realtime/company",
    email_path: "/api/realtime/email"
  }
};