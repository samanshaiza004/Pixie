// src/App.tsx
import { GlobalStyle } from './styles/GlobalStyle'
import { Dirent } from 'original-fs'
import React, { useState, useEffect } from 'react'
import { FileItem } from './components/FileItem'
import { FileAddressItem } from './components/FileAddressItem/FileAddressItem'

interface FileInfo {
  name: string
  isDirectory: boolean
}

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
  const [files, setFiles] = useState<FileInfo[]>([])
  const [path, setPath] = useState<string[]>([
    '/',
    'home',
    'saman',
    'dev',
    'july2024',
  ])
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const getFiles = () => {
    window.Main.readdir(path)
      .then((result: any) => {
        const sortedFiles = sortFiles(result)
        setFiles(sortedFiles)
      })
      .catch((err: string) => window.Main.sendMessage('App.tsx: ' + err))
  }

  // sort files: directories first, then files, then alphabetically
  const sortFiles = (files: FileInfo[]): FileInfo[] => {
    return files.sort((a: FileInfo, b: FileInfo) => {
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
    getFiles()
  }, [path])

  const handleDirectoryClick = async (dir: string) => {
    scrollToTop()
    window.Main.sendMessage('directory clicked: ' + dir)
    const newPath = await window.Main.moveDir(path, dir)
    window.Main.sendMessage('new path: ' + JSON.stringify(newPath))
    setPath(newPath.slice(0, newPath.length))
  }
  return (
    <div style={{ color: 'white' }}>
      <div
        style={{
          flexDirection: 'row',
          display: 'flex',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
        }}
      >
        {path.map((dir, index) => (
          <FileAddressItem
            key={index}
            onClick={() => handleDirectoryClick(dir)}
            fileName={dir}
          />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        {files ? (
          files.map((file, index) => {
            const fullPath = window.Main.renderPath([...path, file.name])
            return (
              <FileItem
                key={index}
                style={{
                  color: window.Main.isDirectory(fullPath) ? 'red' : 'black',
                }}
                onClick={() => {
                  if (window.Main.isDirectory(fullPath)) {
                    handleDirectoryClick(file.name)
                  }
                }}
                fileName={file.name}
                isDirectory={file.isDirectory}
              >
                {file.name}{' '}
              </FileItem>
            )
          })
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}
