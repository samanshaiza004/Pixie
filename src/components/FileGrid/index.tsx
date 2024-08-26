import React from 'react'
import { FileItem } from '../FileItem'
import { FileInfo } from '../../@types/FileInfo'
interface FileGridProps {
  files: FileInfo[]
  directoryPath: string[]
  onDirectoryClick: (path: string[]) => void
  onFileClick: (file: FileInfo) => void
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  directoryPath,
  onDirectoryClick,
  onFileClick,
}) => {
  const handleFileClick = (file: FileInfo) => {
    const fullPath = window.Main.renderPath([...directoryPath, file.name])
    if (file.isDirectory) {
      onDirectoryClick([...directoryPath, file.name])
    } else {
      onFileClick(file)
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      {files.length > 0 ? (
        files.map((file, index) => (
          <FileItem
            key={index}
            onClick={() => handleFileClick(file)}
            fileName={file.name}
            isDirectory={file.isDirectory}
            location={window.Main.renderPath([...directoryPath, file.name])}
          />
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default FileGrid
