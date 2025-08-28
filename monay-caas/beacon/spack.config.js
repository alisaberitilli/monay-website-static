const { config } = require("@swc/core/spack");

module.exports = config({
  mode: "production",
  entry: {
    server: __dirname + "/_server/index.ts",
  },
  output: {
    path: __dirname + "/lib",
  },
});
