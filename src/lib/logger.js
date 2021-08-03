const Sentry = require("@sentry/electron");
const { CaptureConsole } = require("@sentry/integrations");
const log = require("electron-log");

log.transports.console.format = "[{h}:{i}:{s}.{ms}] {text}";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] {text}";
log.transports.file.level = "debug";

Sentry.init({
  dsn: "https://b32c5d25554f4e6ebed361104462766a@o940691.ingest.sentry.io/5890015",
  integrations: [
    new CaptureConsole({
      levels: ["error"],
    }),
  ],
});

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
  log,
};
