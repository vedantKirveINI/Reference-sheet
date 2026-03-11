let ExecuteFlow = require("../../src/service/executeFlow");
let httpFlow = require("../samples/http");

try {
  let execute_instance = new ExecuteFlow(httpFlow, {});
  let result = await execute_instance.execute();
  console.log("result==>", result);
} catch (e) {
  console.error("Error==>", e);
}
    
