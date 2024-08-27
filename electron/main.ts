// electron/main.ts
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  net,
  protocol,
  globalShortcut,
  Menu,
  MenuItem,
} from 'electron'
import { updateElectronApp } from 'update-electron-app'
import { autoUpdater } from 'electron'

import Store from 'electron-store'
import path from 'path'

const serverUrl = 'https://update.electronjs.org'
const feed = `${serverUrl}/samanshaiza004/pixie/${process.platform}-${
  process.arch
}/${app.getVersion()}`

autoUpdater.setFeedURL(feed)

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const store = new Store()

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'sample',
    privileges: { bypassCSP: true, stream: true, supportFetchAPI: true },
  },
])

if (require('electron-squirrel-startup')) app.quit()

app.whenReady().then(() => {
  protocol.handle('sample', request => {
    const filePath = request.url.replace('sample:///', '')
    return net.fetch('file://' + filePath)
  })
})

const menu = new Menu()
menu.append(
  new MenuItem({
    label: 'Search',
    submenu: [
      {
        role: 'help',
        accelerator: process.platform === 'darwin' ? 'Cmd+L' : 'Ctrl+L',
        click: () => {
          mainWindow?.webContents.executeJavaScript(
            "document.getElementById('search-bar').focus()"
          )
        },
      },
    ],
  })
)

Menu.setApplicationMenu(menu)

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    backgroundColor: '#f8f8ff',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  ipcMain.handle('open-directory-picker', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select a directory',
    })
    if (result.filePaths[0]) {
      store.set('lastSelectedDirectory', result.filePaths[0])
    }
    return result.filePaths[0]
  })

  ipcMain.handle('get-last-selected-directory', async () => {
    return store.get('lastSelectedDirectory')
  })
}

ipcMain.on('ondragstart', (event, filePath) => {
  const absolutePath = path.resolve(filePath)

  event.sender.startDrag({
    file: absolutePath,
    icon: 'public/maxresdefault.jpeg',
  })
})

async function registerListeners() {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on('message', (_, message) => {
    console.log(message)
  })
}

app
  .on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
