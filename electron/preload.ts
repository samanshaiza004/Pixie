import { contextBridge, ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'

interface FileInfo {
  name: string
  isDirectory: boolean
}

const api = {
  sendMessage: (message: string) => {
    ipcRenderer.send('message', message)
  },
  renderPath: (pathParts: string[]) => {
    return path.join(...pathParts)
  },
  readdir: (pathParts: string[]): Promise<FileInfo[]> => {
    return new Promise((resolve, reject) => {
      const renderedPath = path.join(...pathParts)
      ipcRenderer.send('message', 'reading directory: ' + renderedPath)
      fs.readdir(renderedPath, { withFileTypes: true }, (err, files) => {
        if (err) {
          ipcRenderer.send('message', 'readdir preload.ts: ' + err)
          reject(new Error(err as unknown as string))
        } else {
          resolve(
            files.map(file => ({
              name: file.name,
              isDirectory: file.isDirectory(),
            }))
          )
        }
      })
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
          ipcRenderer.send('message', 'preload.ts: Directory not found')
        }
      } catch (err) {
        ipcRenderer.send('message', 'moveDir preload.ts: ' + err)
      }
    }
    ipcRenderer.send('message', 'preload.ts: returning path ' + currentPath)
    return currentPath
  },

  isDirectory: (fullPath: string): boolean => {
    try {
      return fs.lstatSync(fullPath).isDirectory()
    } catch (e) {
      ipcRenderer.send(
        'message',
        'preload.ts: Error checking if path is directory: ' + e
      )
      return false
    }
  },
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
  containsDir: (files: FileInfo[], dir: string): boolean => {
    for (const file of files) {
      if (file.name === dir && file.isDirectory) {
        return true
      }
    }
    return false
  },
}

contextBridge.exposeInMainWorld('Main', api)
