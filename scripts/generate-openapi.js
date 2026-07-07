const { writeFileSync } = require("fs");
const path = require("path");

require("dotenv").config();
require("ts-node").register({ transpileOnly: true });
const swaggerSpec = require("../src/config/swagger").default;

writeFileSync(
	path.join(__dirname, "..", "openapi.json"),
	JSON.stringify(swaggerSpec, null, 2),
	"utf-8"
);
console.log("openapi.json generated successfully");
