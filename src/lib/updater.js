const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");

const logger = require("./logger");

autoUpdater.autoDownload = false;

autoUpdater.on("error", (error) => {
  dialog.showErrorBox(
    "Error: ",
    error == null ? "unknown" : (error.stack || error).toString()
  );
});

autoUpdater.on("update-available", () => {
  dialog.showMessageBox(
    {
      type: "info",
      title: "Found Updates",
      message: "Found a new version, do you want update now?",
      buttons: ["Yes", "No"],
    },
    (buttonIndex) => {
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate();
      }
    }
  );
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox(
    {
      title: "Install Updates",
      message: "Updates downloaded, application will close and update...",
    },
    () => {
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  );
});

async function _update() {
  return new Promise(async (resolve, reject) => {
    try {
      autoUpdater.logger = logger;
      // return resolve(autoUpdater.checkForUpdatesAndNotify())
      return resolve(autoUpdater.checkForUpdates());
    } catch (err) {
      reject(err);
    }
  });
}

exports.update = _update;
