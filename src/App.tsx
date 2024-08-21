import { useState, useEffect } from 'react'
import { DirectoryPicker } from './components/DirectoryPicker'
import DirectoryView from './components/DirectoryView'
import SearchBar from './components/SearchBar'
import FileGrid from './components/FileGrid'
import AudioPlayer from './components/AudioPlayer'
import { FileInfo } from './@types/FileInfo'
import { useAudio } from './hooks/AudioContextProvider'
export function App() {
  const [directoryPath, setDirectoryPath] = useState<string[]>([])
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<FileInfo[]>([])
  const [files, setFiles] = useState<FileInfo[]>([])
  const [shouldReplay, setShouldReplay] = useState<boolean>(false)
  const FILE_EXTENSIONS = {
    images: ['jpg', 'png'],
    text: ['txt', 'md'],
    audio: ['mp3', 'wav', 'flac', 'ogg'],
    video: ['mp4', 'mov', 'avi'],
  }

  const { playAudio } = useAudio()

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

  /** Initiates a search for files and directories matching the query */
  const searchFiles = () => {
    window.Main.search(directoryPath, searchQuery)
      .then((result: any) => setSearchResults(result))
      .catch((err: any) => window.Main.sendMessage('App.tsx: ' + err))
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
  }, [])

  const handleFileClick = (file: FileInfo) => {
    setCurrentAudio('')
    const extension = file.name.split('.').pop()
    const filePath = window.Main.renderPath([...directoryPath, file.name])
    if (extension && FILE_EXTENSIONS.audio.includes(extension)) {
      const audioPath = window.Main.renderPath([...directoryPath, file.name])

      playAudio(`sample:///${audioPath}`)
      /* window.Main.sendMessage('App.tsx: shouldReplay: ' + shouldReplay)
      if (currentAudio === filePath) {
        setShouldReplay(true)
      } else {
        setShouldReplay(false)
        setCurrentAudio(audioPath)
      } */
    }
  }

  return (
    <div style={{ height: '100vh' }}>
      <DirectoryPicker onDirectorySelected={setDirectoryPath} />
      <DirectoryView
        directoryPath={directoryPath}
        onDirectoryClick={setDirectoryPath}
      />
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={searchFiles}
      />
      <FileGrid
        files={searchResults.length > 0 ? searchResults : files}
        directoryPath={directoryPath}
        onDirectoryClick={setDirectoryPath}
        onFileClick={handleFileClick}
      />
      <AudioPlayer
        currentAudio={currentAudio}
        volume={volume}
        setVolume={setVolume}
        shouldReplay
      />
    </div>
  )
}
