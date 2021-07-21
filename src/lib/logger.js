const log = require("electron-log");

log.transports.console.format = "[{h}:{i}:{s}.{ms}] {text}";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] {text}";
log.transports.file.level = "debug";

module.exports = {
  info: function (tag, msg) {
    log.info(`[${tag}] [INFO] ${msg}`);
  },
  debug: function (tag, msg) {
    log.debug(`[${tag}] [DEBUG] ${msg}`);
  },
  error: function (tag, msg) {
    log.error(`[${tag}] [ERROR] ${msg}`);
  },
};
