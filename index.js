var menubar = require('./electron/menubar');
const {app, Menu, protocol, ipcMain, BrowserWindow} = require('electron')
const path = require('path');
const url = require('url');
const autoUpdater = require("electron-updater").autoUpdater
const {
  validate,
  mapGrantTypeToTask,
  needWindowForGrantType,
} = require("./electron/oauth-helper")

const isLinux = process.platform === 'linux';
const isMacos = process.platform === 'darwin';
const iconPath = isMacos ? './electron/icon16.png' : './electron/icon.png';
const iconNotifPath = isMacos ? './electron/notif16.png' : './electron/notif.png';
const rightClickWindow = isMacos || isLinux;
const viewPosition = isMacos || isLinux ? 'topRight' : 'bottomRight';

var mb = menubar({
  index: url.format({
    pathname: 'index.html',
    protocol: 'file:',
    slashes: true
  }),
  showOnRightClick: rightClickWindow,
  icon: iconPath,
  tooltip: 'VuChess',
  width: 398,
  height: 473,
  skipTaskbar: true,
  windowPosition: viewPosition,
  preloadWindow: false,
  webPreferences: {
    nativeWindowOpen: true,
    webSecurity: false
  }
});

if(process.env.NODE_ENV=='development')
    mb.window.webContents.openDevTools()

ipcMain.on('turn-notif', (event, activate) => {
  if(activate) {
    mb.tray.setImage(path.join(__dirname, iconNotifPath));
  } else {
    mb.tray.setImage(path.join(__dirname, iconPath));
  }
});

ipcMain.on('start-oauth', (event, config) => {
    const customAuthorizationRequestParameter = {};
    const customAccessTokenRequestParameter = {};
    const type = config.response_type || config.grant_type || "code";
    const task = mapGrantTypeToTask(type);
    const userCancelError = new Error("User cancelled");
    let window = new BrowserWindow({
        parent: mb.window,
        resizable: false,
        alwaysOnTop: true,
        modal: true,
        width: 600,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });
    window.setMenu(null);
    window.once("ready-to-show", () => {
      window.show();
    });
    window.once("close", () => {
      window = null;
    });

    task(config, window, customAuthorizationRequestParameter, customAccessTokenRequestParameter)
      .then(resp => {
        window.close();
        if (resp.error) {
          event.sender.send('oauth-received', {success: false, data: resp});
        } else {
          event.sender.send('oauth-received', {success: true, data: resp});
        }
    });
});

mb.app.on('ready',() => {
  protocol.interceptFileProtocol('file', function(request, callback) {
        // // Strip protocol
        let url = request.url.substr('file://'.length + 1);

        // Build complete path for node require function
        url = path.join(__dirname, 'dist', url);

        // Replace backslashes by forward slashes (windows)
        // url = url.replace(/\\/g, '/');
        url = path.normalize(url);

        callback({path: url});
  });

  autoUpdater.checkForUpdatesAndNotify();
});

mb.on('ready', ready => {
  if(isLinux || isMacos) {
    let cm = [
      {label: 'Show', type: 'normal', click: (menuItem, browserWindow, event) => {
        if(!showed) {
          showMenuWindow(cm, mb);
          mb.showWindow();
        } else {
          hideMenuWindow(cm, mb);
          mb.hideWindow();
        }
      }},
      {label: 'Quit', type: 'normal', click: (menuItem, browserWindow, event) => {
        mb.app.quit();
      }}
    ];

    mb.on('hide',() => hideMenuWindow(cm, mb));
    mb.on('show',() => showMenuWindow(cm, mb));

    var contextMenu = Menu.buildFromTemplate(cm);
  } else {
    var contextMenu = Menu.buildFromTemplate([
      {label: 'Quit', type: 'normal', click: (menuItem, browserWindow, event) => {
        mb.app.quit();
      }}
    ]);
  }

  // Call this again for Linux because we modified the context menu
  mb.tray.setContextMenu(contextMenu)
  console.log('app is ready')
});

var showed = false;
function hideMenuWindow(cm) {
  cm[0].label = 'Show';
  mb.tray.setContextMenu(Menu.buildFromTemplate(cm));
  showed = false;
}

function showMenuWindow(cm, mb) {
  cm[0].label = 'Hide';
  mb.tray.setContextMenu(Menu.buildFromTemplate(cm));
  showed = true;
}
