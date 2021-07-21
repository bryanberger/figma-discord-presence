const { app } = require("electron");
const path = require("path");

function _getAppData(subpath) {
  return path.join(_getAppDataPath(), subpath);
}

function _getAppDataPath() {
  return app.getPath("userData");
}

function _getHomePath() {
  return app.getPath("home");
}

function _getPath(path) {
  return app.getPath(path)
}

function _timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.getAppData = _getAppData;
exports.getAppDataPath = _getAppDataPath;
exports.getHomePath = _getHomePath;
exports.getPath = _getPath;
exports.timeout = _timeout;
