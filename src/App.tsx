// src/App.tsx
import { GlobalStyle } from './styles/GlobalStyle'
import { Dirent } from 'original-fs'
import React, { useState, useEffect } from 'react'

export function App() {
  const [files, setFiles] = useState<Dirent[]>([])
  const [path, setPath] = useState<string[]>(['', 'home', 'saman', 'dev'])
  const getFiles = () => {
    window.Main.sendMessage('getting files for path: ' + path)
    window.Main.readdir(path)
      .then(result => {
        window.Main.sendMessage('files received: ' + result)
        setFiles(result)
      })
      .catch(err => window.Main.sendMessage('App.tsx: ' + err))
  }
  useEffect(() => {
    window.Main.sendMessage('App.tsx: useEffect called with path: ' + path)
    getFiles()
  }, [path])
  const handleDirectoryClick = async (dir: string) => {
    window.Main.sendMessage('directory clicked: ' + dir)
    const newPath = await window.Main.moveDir(path, dir)
    window.Main.sendMessage(newPath)
    setPath(newPath)
  }
  return (
    <div style={{ color: 'white' }}>
      <div style={{ flexDirection: 'row', display: 'flex' }}>
        {path.map((dir, index) => (
          <p key={index}>{dir}</p>
        ))}
      </div>
      {files ? (
        files.map((file, index) => {
          const fullPath = window.Main.renderPath([...path, file.name])
          return (
            <p
              key={index}
              style={{
                color: window.Main.isDirectory(fullPath) ? 'red' : 'white',
              }}
              onClick={() =>
                window.Main.isDirectory(fullPath) &&
                handleDirectoryClick(file.name)
              }
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
