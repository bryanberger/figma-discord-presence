const { autoUpdater } = require("electron-updater");
const { app, dialog } = require("electron");
const logger = require("./logger");

autoUpdater.autoDownload = false;

autoUpdater.on("error", (error) => {
  dialog.showErrorBox(
    "Error: ",
    error == null ? "unknown" : (error.stack || error).toString()
  );
});

autoUpdater.on("update-available", async () => {
  const { response } = await dialog.showMessageBox({
    type: "question",
    title: "Found Updates",
    message: "Found a new version, do you want update now?",
    defaultId: 0,
    cancelId: 1,
    buttons: ["Yes", "No"],
  });

  if (response === 0) {
    logger.debug("updater", "update available");
    await autoUpdater.downloadUpdate();
  }
});

autoUpdater.on("update-downloaded", async () => {
  const { response } = await dialog.showMessageBox({
    type: "question",
    title: "Update Download",
    buttons: ["Install and Relaunch", "Later"],
    defaultId: 0,
    cancelId: 1,
    message: `A new version of ${app.getName()} has been downloaded!`,
  });

  if (response === 0) {
    setImmediate(() => autoUpdater.quitAndInstall());
  }
});

autoUpdater.on("download-progress", (progressObj) =>
  logger.debug(
    "updater",
    `Update Download progress: ${JSON.stringify(progressObj)}`
  )
);

async function _simpleCheck() {
  const { versionInfo, updateInfo } = await _update();

  if (versionInfo && updateInfo && versionInfo.version === updateInfo.version) {
    await dialog.showMessageBox({
      type: "info",
      message: "You're up-to-date!",
      detail: `${app.getName()} ${versionInfo.version} is currently the newest version available.`
    });
  }
}

async function _update() {
  return new Promise(async (resolve, reject) => {
    try {
      autoUpdater.logger = logger.log;
      // return resolve(autoUpdater.checkForUpdatesAndNotify());
      return resolve(autoUpdater.checkForUpdates());
    } catch (err) {
      reject(err);
    }
  });
}

exports.update = _update;
exports.simpleCheck = _simpleCheck;
