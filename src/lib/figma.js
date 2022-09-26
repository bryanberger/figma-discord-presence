const _ = require("lodash");
const bplist = require("bplist-parser");
const psList = require("ps-list");
const winInfo = require("@bberger/win-info-fork");
const fs = require("fs");

const logger = require("./logger");
const util = require("./util");

async function getFigmaMetaData() {
  let currentFigmaFilename = null;
  let shareLink = null;

  try {
    if (process.platform === "darwin") {
      const parsed = await bplist.parseFile(
        `${util.getHomePath()}/Library/Saved Application State/com.figma.Desktop.savedState/windows.plist`
      );

      currentFigmaFilename =
        _.flattenDeep(parsed).find((o) => o.hasOwnProperty("NSTitle"))[
          "NSTitle"
        ] || null;
    } else if (process.platform === "win32") {
      // Find the main Figma process first
      const processList = await psList();
      const figmaProcesses =
        processList.filter((p) => p.name.includes("Figma.exe")) || [];

      // The main Figma process is the one that matches as a parent pid (ppid) from the others
      // Should only be 1
      const mainFigmaProcess = _.intersectionWith(
        figmaProcesses,
        (a, b) => a.ppid === b.pid
      ).shift();

      // Lookup its window title
      if (mainFigmaProcess) {
        try {
          const figmaWindow = winInfo.getByPidSync(mainFigmaProcess.pid);
          if (figmaWindow && figmaWindow.title.includes(" - Figma")) {
            currentFigmaFilename = figmaWindow.title.split(" - Figma")[0];
          }
        } catch (err) {}
      }
    }

    if (currentFigmaFilename === null) {
      return { currentFigmaFilename, shareLink };
    }

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
            `https://www.figma.com${path}/${params ? params : ""}`
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
  let isRunning = false;
  const processList = await psList();

  if (process.platform === "darwin") {
    isRunning =
      processList.filter((p) =>
        p.cmd.includes("Figma.app/Contents/MacOS/Figma")
      ).length > 0;
  } else if (process.platform === "win32") {
    isRunning =
      processList.filter((p) => p.name.includes("Figma.exe")).length > 0;
  }

  return isRunning;
}

async function getIsFigmaActive() {
  let isActive = false;

  try {
    const activeWin = await winInfo.getActive();
    isActive = activeWin?.owner?.name.includes("Figma") || false;
  } catch (err) {}

  return isActive;
}

module.exports = {
  getFigmaMetaData,
  getIsFigmaRunning,
  getIsFigmaActive,
};
