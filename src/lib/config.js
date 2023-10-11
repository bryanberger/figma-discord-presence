const convict = require("convict");
const fs = require("fs-extra");

const logger = require("./logger");
const util = require("./util");

const retries = 10;

const conf = convict({
  hideFilenames: {
    doc: "Show or hide filenames",
    default: false,
    format: "Boolean",
  },
  hideStatus: {
    doc: "Show or hide active/idle status",
    default: false,
    format: "Boolean",
  },
  hideViewButton: {
    doc: "Show or hide the view in figma button",
    default: true,
    format: "Boolean",
  },
  autoCheckForUpdates: {
    doc: "Periodically check for updates",
    default: true,
    format: "Boolean",
  },
  // connectOnStartup: {
  //   doc: "Connect to Discord on application startup",
  //   default: true,
  //   format: "Boolean",
  // },
});

function load() {
  return new Promise(async (resolve, reject) => {
    try {
      const json = util.getAppData("/config.json");
      conf.loadFile(json);

      logger.debug("config", "loaded!");
      return resolve(conf.validate());
    } catch (err) {
      reject(err);
    }
  });
}

function save(times, init = false) {
  times = times || 0;
  const options = { spaces: 2 };

  if (init) {
    options.flag = "wx";
  }

  try {
    fs.writeJsonSync(
      util.getAppData("/config.json"),
      conf.getProperties(),
      options
    );
  } catch (err) {
    // if any other error than 'File already exists' then retry.
    if (err.code !== "EEXIST") {
      logger.error("config", err.message);
      if (times < retries) {
        setTimeout(() => {
          save(times + 1);
        }, 1000);
      }
    }
  }
  logger.debug("config", "saved!");
}

function getAll() {
  if (conf) {
    return conf.getProperties();
  }
}

module.exports = conf;
module.exports.load = load;
module.exports.save = save;
module.exports.getAll = getAll;
