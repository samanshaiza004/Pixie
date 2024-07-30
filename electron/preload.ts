import { Dirent } from 'fs'

const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

export const api = {
  sendMessage: (message: string) => {
    ipcRenderer.send('message', message)
  },
  renderPath: (pathParts: string[]) => {
    return path.join(...pathParts)
  },
  readdir: (path: string[]): Promise<Dirent[]> => {
    return new Promise((resolve, reject) => {
      let renderedPath = path.join('/')
      ipcRenderer.send('message', 'reading directory: ' + renderedPath)
      fs.readdir(
        renderedPath,
        { encoding: 'utf-8', withFileTypes: true },
        (err: any, files: any) => {
          if (err) {
            ipcRenderer.send('message', 'bridge.ts: ' + err)
            reject(new Error(err as unknown as string))
          } else {
            // ipcRenderer.send('message', 'files received ' + files)
            resolve(files)
          }
        }
      )
    })
  },
  moveDir: async (currentPath: string[], newDir: string) => {
    let ind = currentPath.indexOf(newDir)
    if (ind !== -1) {
      return currentPath.slice(0, ind + 1)
    } else {
      try {
        const dirItems = await api.readdir(currentPath)
        if (api.containsDir(dirItems, newDir)) {
          currentPath.push(newDir)
        } else {
          ipcRenderer.send('message', 'bridge.ts: Directory not found')
        }
      } catch (err) {
        ipcRenderer.send('message', 'bridge.ts: ' + err)
      }
    }
    ipcRenderer.send('message', 'bridge.ts: returning path ' + currentPath)
    return currentPath
  },

  isDirectory: (path: string): boolean => {
    try {
      return fs.lstatSync(path).isDirectory()
    } catch (e) {
      ipcRenderer.send('message', 'Error checking if path is directory: ' + e)
      return false
    }
  },
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
  containsDir: (files: any[], dir: string): boolean => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].name === dir && files[i].isDirectory()) {
        return true
      }
    }
    return false
  },
}

contextBridge.exposeInMainWorld('Main', api)
