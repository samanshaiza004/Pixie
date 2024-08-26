// electron/preload.ts
import { render } from '@testing-library/react'
import { contextBridge, ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'

import { FileInfo } from '../src/@types/FileInfo'

export const api = {
  /** Sends a message to the main process */
  sendMessage: (message: string) => {
    ipcRenderer.send('message', message)
  },

  /** Joins parts of a path into a single string */
  renderPath: (pathParts: string[]): string => {
    return path.join(...pathParts)
  },

  /** Reads the contents of a directory and returns a list of files and directories */
  readdir: (directoryParts: string[]): Promise<FileInfo[]> => {
    return new Promise((resolve, reject) => {
      const directoryPath = path.join(...directoryParts)
      ipcRenderer.send('message', 'Reading directory: ' + directoryPath)

      fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
        if (err) {
          const errorMessage = `Error reading directory ${directoryPath}: ${err}`
          ipcRenderer.send('message', errorMessage)
          reject(new Error(errorMessage))
        } else {
          const fileInfoList = files.map(file => ({
            name: file.name,
            location: directoryPath,
            isDirectory: file.isDirectory(),
          }))
          resolve(fileInfoList)
        }
      })
    })
  },

  /** Moves to a new directory within the current path or returns the updated path */
  moveDirectory: async (
    currentPath: string[],
    newDirectory: string
  ): Promise<string[]> => {
    const directoryIndex = currentPath.indexOf(newDirectory)
    if (directoryIndex !== -1) {
      return currentPath.slice(0, directoryIndex + 1)
    } else {
      try {
        const directoryContents = await api.readdir(currentPath)
        if (api.containsDirectory(directoryContents, newDirectory)) {
          currentPath.push(newDirectory)
        } else {
          ipcRenderer.send('message', 'Directory not found: ' + newDirectory)
        }
      } catch (err) {
        ipcRenderer.send('message', 'Error in moveDirectory: ' + err)
      }
    }
    ipcRenderer.send('message', 'Returning updated path: ' + currentPath)
    return currentPath
  },

  /** Retrieves the last selected directory from the main process */
  getLastSelectedDirectory: (): Promise<string | null> => {
    return ipcRenderer.invoke('get-last-selected-directory')
  },

  /** Checks if the given path is a directory */
  isDirectory: (fullPath: string): boolean => {
    try {
      return fs.lstatSync(fullPath).isDirectory()
    } catch (err) {
      ipcRenderer.send('message', 'Error checking if path is directory: ' + err)
      return false
    }
  },

  /** Listens for messages from the main process */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },

  /** Checks if a directory exists within a list of files */
  containsDirectory: (files: FileInfo[], directoryName: string): boolean => {
    return files.some(file => file.name === directoryName && file.isDirectory)
  },

  /** Opens the directory picker and returns the selected directory */
  openDirectoryPicker: (): Promise<string | null> => {
    return ipcRenderer.invoke('open-directory-picker')
  },

  /** Initiates a drag event for a file */
  startDrag: (filename: string) => {
    ipcRenderer.send('message', 'Starting drag for file: ' + filename)
    ipcRenderer.send('ondragstart', filename)
  },

  doesFileExist: (filePath: string): boolean => {
    try {
      return fs.existsSync(filePath)
    } catch (err) {
      ipcRenderer.send('message', 'Error checking if file exists: ' + err)
      return false
    }
  },

  search: (directoryParts: string[], query: string): Promise<FileInfo[]> => {
    const directoryPath = path.join(...directoryParts)

    const searchRecursively = (dir: string, query: string): FileInfo[] => {
      let results: FileInfo[] = []
      try {
        const files = fs.readdirSync(dir, { withFileTypes: true })
        files.forEach(file => {
          const fullPath = path.join(dir, file.name)
          if (file.name.includes(query)) {
            results.push({
              name: file.name,
              location: fullPath,
              isDirectory: file.isDirectory(),
            })
          }
          if (file.isDirectory()) {
            results = results.concat(searchRecursively(fullPath, query))
          }
        })
      } catch (err: any) {
        ipcRenderer.send('message', `Error searching directory ${dir}: ${err}`)
      }
      return results
    }

    return new Promise((resolve, reject) => {
      try {
        const results = searchRecursively(directoryPath, query)
        resolve(results)
      } catch (err) {
        reject(err)
      }
    })
  },
}

contextBridge.exposeInMainWorld('Main', api)
