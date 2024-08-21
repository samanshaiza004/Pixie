import React from 'react'
import { FileAddressItem } from '../FileAddressItem/FileAddressItem'

interface DirectoryViewProps {
  directoryPath: string[]
  onDirectoryClick: (path: string[]) => void
}

const DirectoryView: React.FC<DirectoryViewProps> = ({
  directoryPath,
  onDirectoryClick,
}) => {
  const handleClick = (directory: string, index: number) => {
    onDirectoryClick(directoryPath.slice(0, index + 1))
  }

  return (
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
          onClick={() => handleClick(directory, index)}
          fileName={directory}
        />
      ))}
    </div>
  )
}

export default DirectoryView
