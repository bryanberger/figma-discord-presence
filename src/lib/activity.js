const EventEmitter = require("events");
const RPC = require("discord-rpc");

const {
  getIsFigmaRunning,
  getFigmaMetaData,
  getIsFigmaActive,
} = require("./figma");
const logger = require("./logger");
const config = require("./config");
const events = require("./events");

const CLIENT_ID = "866719067092418580";

class Activity extends EventEmitter {
  constructor() {
    super();

    this.client = null;
    this.setActivityInterval = null;
    this.startTime = null;

    // if (config.get("connectOnStartup")) {
    //   this.login();
    // }
  }

  async login() {
    this.emit(events.DISCORD_CONNECTING);
    this.client = new RPC.Client({ transport: "ipc" });

    this.client.on("ready", () => {
      this.emit(events.DISCORD_READY);
      this.setActivity();
      this.startInterval();
    });

    this.client.on("disconnected", () => {
      this.emit(events.DISCORD_DISCONNECTED);
      this.destroy();
    });

    try {
      await this.client.login({ clientId: CLIENT_ID });
    } catch (err) {
      logger.error("activity", err.message);
      this.emit(events.DISCORD_LOGIN_ERROR);
      this.client = null;
    }
  }

  async setActivity() {
    if (this.client === null) return;

    try {
      const isFigmaRunning = await getIsFigmaRunning();

      if (isFigmaRunning) {
        if (!this.startTime) {
          this.startTime = new Date();
        }
      } else {
        await this.client.clearActivity();
        this.startTime = null;
        return;
      }

      const { currentFigmaFilename, shareLink } = await getFigmaMetaData();

      if (currentFigmaFilename === null) {
        return;
      }

      const isFigmaActive = await getIsFigmaActive();

      // Gather Config Options
      const isHideFilenames = config.get("hideFilenames");
      const isHideStatus = config.get("hideStatus");
      const isHideViewButton = config.get("hideViewButton");

      // Build detail string
      const details = [
        !isHideStatus ? (isFigmaActive ? "Active" : "Idle") : "",
        `${!isHideStatus && !isHideFilenames ? " " : ""}`,
        !isHideFilenames ? `in: "${currentFigmaFilename}"` : undefined,
      ];

      // You'll need to have the logo asset uploaded to
      // https://discord.com/developers/applications/<application_id>/rich-presence/assets
      this.client.setActivity({
        details: details.join("") || undefined,
        startTimestamp: this.startTime,
        largeImageKey: "logo",
        largeImageText: "Designing in Figma",
        buttons:
          !isHideViewButton && shareLink
            ? [{ label: "View in Figma", url: shareLink }]
            : undefined,
        instance: false,
      });
    } catch (err) {
      logger.error("activity", `Failed to setActivity: ${err}`);
    }
  }

  startInterval() {
    this.setActivityInterval = setInterval(() => {
      this.setActivity();
    }, 15e3);
  }

  async stopInterval() {
    clearInterval(this.setActivityInterval);
    this.setActivityInterval = null;
    this.startTime = null;
  }

  async updateOptions() {
    await this.setActivity();
  }

  async connect() {
    await this.login();
  }

  async disconnect() {
    await this.destroy();
  }

  async destroy() {
    try {
      await this.client.clearActivity();
      await this.client.destroy();
    } catch {}

    this.client = null;
    this.stopInterval();
  }
}

module.exports = Activity;
