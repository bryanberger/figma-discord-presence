const EventEmitter = require("events");
const path = require("path");
const { shell, nativeTheme, Menu, Tray } = require("electron");

const config = require("./config");
const logger = require("./logger");
const util = require("./util");
const events = require("./events");

const iconOn = path.join(__dirname, `/../../assets/on.png`);
const iconOff = path.join(__dirname, `/../../assets/off.png`);
// const iconOff = nativeImage.createFromDataURL(offUrl);
// todo use nativeImage and png loader

class CustomTray extends EventEmitter {
  tray = null;
  contextMenu = null;
  state = null;

  baseMenuTemplate = [
    { type: "separator" },
    {
      label: "Options",
      submenu: [
        {
          label: "Hide filenames",
          type: "checkbox",
          checked: config.get("hideFilenames"),
          click: (menuItem) =>
            this.saveConfigAndUpdate("hideFilenames", menuItem.checked),
        },
        {
          label: "Hide active/idle status",
          type: "checkbox",
          checked: config.get("hideStatus"),
          click: (menuItem) =>
            this.saveConfigAndUpdate("hideStatus", menuItem.checked),
        },
        {
          label: 'Hide "View in Figma" button',
          type: "checkbox",
          checked: config.get("hideViewButton"),
          click: (menuItem) =>
            this.saveConfigAndUpdate("hideViewButton", menuItem.checked),
        },
        // {
        //   label: "Connect to Discord when this app starts",
        //   type: "checkbox",
        //   checked: config.get("connectOnStartup"),
        //   click: (menuItem) =>
        //     this.saveConfigAndUpdate("connectOnStartup", menuItem.checked),
        // },
      ],
    },

    { type: "separator" },
    {
      label: "Check for Updates...",
      click: () => this.emit(events.CHECK_FOR_UPDATES),
    },
    {
      label: "Show Config",
      click: () => shell.openPath(util.getAppDataPath()),
    },
    { type: "separator" },
    {
      label: "Exit",
      click: () => this.emit(events.QUIT),
    },
  ];

  constructor(trayState) {
    super();

    logger.debug("tray", "initalized");

    this.state = trayState;

    this.tray = new Tray(this.getIconPath());
    this.update();

    nativeTheme.on("updated", () => this.update());
  }

  getIconPath() {
    const colorMode = nativeTheme.shouldUseDarkColors ? "dark" : "light";
    const iconState = this.state.isDiscordReady ? "on" : "off";
    const iconColorMode =
      colorMode === "dark" ? `darkmode-${iconState}` : `lightmode-${iconState}`;
    const iconPath = path.join(
      __dirname,
      `/../../assets/menuIcon-${iconColorMode}@2x.png`
    );

    return iconPath;
  }

  update() {
    let menuTemplate;

    if (this.state.isDiscordReady) {
      menuTemplate = [
        {
          label: `Connected to Discord`,
          enabled: false,
          icon: iconOn,
        },
        { type: "separator" },
        {
          label: "Disconnect from Discord",
          click: () => this.emit(events.DISCONNECT),
        },
      ].concat(this.baseMenuTemplate);
    } else {
      if (this.state.isDiscordConnecting) {
        menuTemplate = [
          {
            label: "Connecting to Discord",
            enabled: false,
            icon: iconOff,
          },
          { type: "separator" },
          {
            label: "Stop connecting to Discord",
            click: () => this.emit(events.DISCONNECT),
          },
        ].concat(this.baseMenuTemplate);
      } else {
        menuTemplate = [
          {
            label: "Not connected to Discord",
            enabled: false,
            icon: iconOff,
          },
          { type: "separator" },
          {
            label: "Connect to Discord",
            click: () => this.emit(events.CONNECT),
          },
        ].concat(this.baseMenuTemplate);
      }
    }

    this.tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
    this.tray.setImage(this.getIconPath());
  }

  saveConfigAndUpdate(configKey, value) {
    config.set(configKey, value);
    config.save();

    // immeditely try a discord activity update
    this.emit(events.UPDATE_OPTIONS);
  }

  setState(state) {
    this.state = state;
    this.update();
  }
}

// export default CustomTray;
module.exports = CustomTray;
