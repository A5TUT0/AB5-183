const rotatingLogStream = require("@vrbo/pino-rotating-file");

module.exports = rotatingLogStream({
  path: "./logs/app.log",
  size: "1M",
  interval: "1d",
  maxFiles: 5,
});
