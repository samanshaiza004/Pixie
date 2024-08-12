import { useState, useEffect, useRef } from 'react'
import { FileItem } from './components/FileItem'
import { FileAddressItem } from './components/FileAddressItem/FileAddressItem'
import { DirectoryPicker } from './components/DirectoryPicker/DirectoryPicker'
import WaveSurfer from 'wavesurfer.js'

interface FileInfo {
  name: string
  isDirectory: boolean
}

const FILE_EXTENSIONS = {
  images: ['jpg', 'png'],
  text: ['txt', 'md'],
  audio: ['mp3', 'wav', 'flac', 'ogg'],
  video: ['mp4', 'mov', 'avi'],
}

declare global {
  interface Window {
    Main: {
      sendMessage: (message: string) => void
      readdir: (path: string[]) => Promise<FileInfo[]>
      renderPath: (pathParts: string[]) => string
      moveDirectory: (
        currentPath: string[],
        newDir: string
      ) => Promise<string[]>
      isDirectory: (path: string) => boolean
      openDirectoryPicker: () => Promise<string | null>
      getLastSelectedDirectory: () => Promise<string | null>
    }
  }
}

export function App() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [directoryPath, setDirectoryPath] = useState<string[]>([])
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)

  const waveformRef = useRef<HTMLDivElement>(null)
  const waveSurferRef = useRef<WaveSurfer | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  /** Scrolls the page to the top */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** Fetches files from the current directory and sets the sorted result */
  const fetchFiles = () => {
    window.Main.readdir(directoryPath)
      .then(result => {
        const sortedFiles = sortFiles(result)
        setFiles(sortedFiles)
      })
      .catch(err => window.Main.sendMessage('App.tsx: ' + err))
  }

  /** Sorts files by directories first, then by name */
  const sortFiles = (files: FileInfo[]): FileInfo[] => {
    return files.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })
  }

  /** Stops the current audio with a fade-out effect */
  const fadeOutAndStop = (duration: number = 0.5) => {
    if (waveSurferRef.current && gainNodeRef.current) {
      const currentTime = waveSurferRef.current.getCurrentTime()
      gainNodeRef.current.gain.setValueAtTime(1, currentTime)
      gainNodeRef.current.gain.linearRampToValueAtTime(
        0,
        currentTime + duration
      )
      if (waveSurferRef.current) {
        setTimeout(() => {
          waveSurferRef.current?.stop()
          gainNodeRef.current?.gain.setValueAtTime(
            1,
            waveSurferRef.current.getCurrentTime()
          )
        }, duration * 1000)
      }
    }
  }

  /** Plays audio at the given path with fade-out for any currently playing audio */
  const playAudio = (filePath: string) => {
    if (waveSurferRef.current) {
      fadeOutAndStop()
      setTimeout(() => waveSurferRef.current?.load(filePath), 10)
    }
  }

  /** Handles navigation to a clicked directory */
  const handleDirectoryClick = async (directoryName: string) => {
    scrollToTop()
    const newDirectoryPath = await window.Main.moveDirectory(
      directoryPath,
      directoryName
    )
    setDirectoryPath(newDirectoryPath)
  }

  /** Handles the selection of a file and plays it if it's an audio file */
  const handleFileClick = (file: FileInfo) => {
    const extension = file.name.split('.').pop()
    if (extension && FILE_EXTENSIONS.audio.includes(extension)) {
      const audioPath = window.Main.renderPath([...directoryPath, file.name])
      setCurrentAudio(audioPath)
      playAudio(`sample:///${audioPath}`)
    }
  }

  /** Handles the selection of a directory from the directory picker */
  const handleDirectorySelected = async (directory: string) => {
    setDirectoryPath([directory])
  }

  useEffect(() => {
    fetchFiles()
  }, [directoryPath])

  useEffect(() => {
    const initializeApp = async () => {
      const lastSelectedDirectory = await window.Main.getLastSelectedDirectory()
      if (lastSelectedDirectory) {
        setDirectoryPath([lastSelectedDirectory])
      }
    }

    initializeApp()

    if (waveformRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'white',
        progressColor: '#433fc4',
        barWidth: 4,
        barRadius: 30,
        barHeight: 4,
        height: 64,
      })

      waveSurferRef.current.setVolume(volume)

      waveSurferRef.current.on('ready', () => waveSurferRef.current?.play())
      waveSurferRef.current.on('click', () => waveSurferRef.current?.play())
    }
  }, [])

  useEffect(() => {
    waveSurferRef.current?.setVolume(volume)
  }, [volume])

  return (
    <div style={{ height: '100vh' }}>
      <DirectoryPicker onDirectorySelected={handleDirectorySelected} />
      <div
        style={{
          flexDirection: 'row',
          display: 'flex',
          position: 'sticky',
          top: 0,
          backgroundColor: 'f8f8ff',
        }}
      >
        {directoryPath.map((directory, index) => (
          <FileAddressItem
            key={index}
            onClick={() => handleDirectoryClick(directory)}
            fileName={directory}
          />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        {files.length > 0 ? (
          files.map((file, index) => {
            const fullPath = window.Main.renderPath([
              ...directoryPath,
              file.name,
            ])
            return (
              <FileItem
                key={index}
                onClick={() => {
                  if (window.Main.isDirectory(fullPath)) {
                    handleDirectoryClick(file.name)
                  } else {
                    handleFileClick(file)
                  }
                }}
                fileName={file.name}
                isDirectory={file.isDirectory}
                location={fullPath}
              >
                {file.name}
              </FileItem>
            )
          })
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div
        style={{
          position: 'fixed',
          bottom: 64,
          width: '100%',
          backgroundColor: '#f8f8ff',
        }}
      >
        <span>currentAudio: {currentAudio}</span>
        <div ref={waveformRef} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Volume: </span>
          <input
            style={{ width: '30%', outline: 'none', opacity: 1 }}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}
