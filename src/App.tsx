// src/App.tsx
import { GlobalStyle } from './styles/GlobalStyle'
import { Dirent } from 'original-fs'
import React, { useState, useEffect } from 'react'

declare global {
  interface Window {
    Main: {
      sendMessage: (message: string) => void
      readdir: (
        path: string[]
      ) => Promise<{ name: string; isDirectory: boolean }[]>
      renderPath: (pathParts: string[]) => string
      moveDir: (currentPath: string[], newDir: string) => Promise<string[]>
      isDirectory: (path: string) => boolean
    }
  }
}

export function App() {
  const [files, setFiles] = useState<Dirent[]>([])
  const [path, setPath] = useState<string[]>([
    '/',
    'home',
    'saman',
    'dev',
    'july2024',
  ])
  const getFiles = () => {
    // window.Main.sendMessage('getting files for path: ' + path)
    window.Main.readdir(path)
      .then((result: any) => {
        // window.Main.sendMessage('files received: ' + result)
        const sortedFiles = sortFiles(result)
        setFiles(result)
      })
      .catch((err: string) => window.Main.sendMessage('App.tsx: ' + err))
  }
  const sortFiles = (files: Dirent[]): Dirent[] => {
    return files.sort((a: Dirent, b: Dirent) => {
      if (a.isDirectory && !b.isDirectory) {
        return -1
      }

      if (!a.isDirectory && b.isDirectory) {
        return 1
      }
      return a.name.localeCompare(b.name)
    })
  }
  useEffect(() => {
    // window.Main.sendMessage('App.tsx: useEffect called with path: ' + path)
    getFiles()
  }, [path])
  const handleDirectoryClick = async (dir: string) => {
    window.Main.sendMessage('directory clicked: ' + dir)
    const newPath = await window.Main.moveDir(path, dir)
    window.Main.sendMessage('new path: ' + JSON.stringify(newPath))
    setPath(newPath.slice(0, newPath.length))
  }
  return (
    <div style={{ color: 'white' }}>
      <div style={{ flexDirection: 'row', display: 'flex' }}>
        {path.map((dir, index) => (
          <button key={index} onClick={() => handleDirectoryClick(dir)}>
            {dir}
          </button>
        ))}
      </div>
      {files ? (
        files.map((file, index) => {
          const fullPath = window.Main.renderPath([...path, file.name])
          return (
            <p
              key={index}
              style={{
                color: window.Main.isDirectory(fullPath) ? 'red' : 'black',
              }}
              onClick={() => {
                if (window.Main.isDirectory(fullPath)) {
                  handleDirectoryClick(file.name)
                }
              }}
            >
              {file.name}{' '}
              {window.Main.isDirectory(fullPath) ? '(Directory)' : ''}
            </p>
          )
        })
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
