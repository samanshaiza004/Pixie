// electron/main.ts
import { app, BrowserWindow, dialog, ipcMain, net, protocol } from 'electron'

import Store from 'electron-store'
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

app.whenReady().then(() => {
  protocol.handle('sample', request => {
    const filePath = request.url.replace('sample:///', '')
    return net.fetch('file://' + filePath)
  })
})

function createWindow() {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
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
    // return null
  })
}

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
