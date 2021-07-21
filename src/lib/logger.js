const log = require("electron-log");

log.transports.console.format = "[{h}:{i}:{s}.{ms}] {text}";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] {text}";
log.transports.file.level = "debug";

const ansiConstants = {
  escStart: "\x1B[",
  escEnd: "m",

  style: {
    bold: "1;",
    unbold: "0;",
  },

  colors: {
    red: 31,
    yellow: 33,
    blue: 34,
    gray: 37,
    default: 39,
  },
};

function getColorCode(color, bold) {
  return bold
    ? `${ansiConstants.escStart}${ansiConstants.style.bold}${ansiConstants.colors[color]}${ansiConstants.escEnd}`
    : `${ansiConstants.escStart}${ansiConstants.style.unbold}${ansiConstants.colors[color]}${ansiConstants.escEnd}`;
}

const redCode = getColorCode("red", true);
const yellowCode = getColorCode("yellow", true);
const blueCode = getColorCode("blue", true);
const grayCode = getColorCode("gray", true);
const defaultCode = getColorCode("default", false);

/**
 * Support highlighting logs in terminal
 * @see https://opensource.com/article/19/9/linux-terminal-colors
 */
module.exports = {
  info: function (tag, msg) {
    log.info(`${yellowCode}[${tag}] ${blueCode}[INFO] ${defaultCode}${msg}`);
  },
  debug: function (tag, msg) {
    log.debug(`${yellowCode}[${tag}] ${grayCode}[DEBUG] ${defaultCode}${msg}`);
  },
  error: function (tag, msg) {
    log.error(`${yellowCode}[${tag}] ${redCode}[ERROR] ${defaultCode}${msg}`);
  },
};
