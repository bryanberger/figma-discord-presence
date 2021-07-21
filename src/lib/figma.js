const _ = require("lodash");
const bplist = require("bplist-parser");
const activeWindow = require("active-win");
const psList = require("ps-list");
const fs = require("fs");

const logger = require("./logger");
const util = require("./util");

async function getFigmaMetaData() {
  let currentFigmaFilename = null;
  let shareLink = null;

  try {
    const parsed = await bplist.parseFile(
      `${util.getHomePath()}/Library/Saved Application State/com.figma.Desktop.savedState/windows.plist`
    );

    currentFigmaFilename =
      _.flattenDeep(parsed).find((o) => o.hasOwnProperty("NSTitle"))[
        "NSTitle"
      ] || null;

    const figmaDataFile = fs.readFileSync(
      `${util.getPath("appData")}/Figma/settings.json`,
      "utf-8"
    );
    const figmaData = JSON.parse(figmaDataFile);
    const flatWindows = _.flattenDeep(figmaData.windows);

    flatWindows.map((window) => {
      window.tabs.map((tab) => {
        const { path, title, params } = tab;
        if (title === currentFigmaFilename) {
          // based on the current file name, we can lookup the id and generate a "view link"
          shareLink = encodeURI(
            `https://www.figma.com${path}/${title}${params ? params : ""}`
          );
        }
      });
    });
  } catch (err) {
    logger.error("figma", err.message);
  }

  return { currentFigmaFilename, shareLink };
}

async function getIsFigmaRunning() {
  const processList = await psList();

  const isRunning =
    processList.filter((p) => p.cmd.search("Figma.app/Contents/MacOS/Figma") > -1).length > 0;

  return isRunning;
}

async function getIsFigmaActive() {
  const activeWin = await activeWindow({ screenRecordingPermission: false });
  const isActive = activeWin?.owner?.name === "Figma" || false;

  return isActive;
}

module.exports = { getFigmaMetaData, getIsFigmaRunning, getIsFigmaActive };
