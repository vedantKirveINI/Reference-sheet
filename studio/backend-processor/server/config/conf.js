let nconf   = require("nconf");
let fs = require("fs");

// Load global config
let file = __dirname + "./config.json";
nconf.file("global", file);

nconf.argv().env();

// Default to localhost env
if (!nconf.get("NODE_ENV")) { nconf.set("NODE_ENV", "dev"); }

// Get enviornment and default to local
const ENV = nconf.get("NODE_ENV") || "dev";

// Optionally set a per environment configuration file e.g. production.json
file = nconf.get("f") != null ? nconf.get("f") : __dirname + `/env/${ENV}.json`;
nconf.file("enviornment", file);

//load flows
let files = fs.readdirSync(__dirname+"/flows");
for (file of files) {
  let file_name = file?.split(".")?.[0];
  nconf.add(file_name, { type: 'literal', store: require(__dirname+`/flows/${file_name}`) });
}

nconf.add("config", { type: 'literal', store: require(__dirname+"/config") });
nconf.add("constants", { type: 'literal', store: require(__dirname+"/constants") });
nconf.add("routes", { type: 'literal', store: require(__dirname+"/routes") });
nconf.add("variables", { type: 'literal', store: require(__dirname+"/variables") });
nconf.add("db_config", { type: 'literal', store: require(__dirname+"/dbConfig") });

module.exports = nconf;