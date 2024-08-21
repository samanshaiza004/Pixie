import React from 'react'

interface DirectoryPickerProps {
  onDirectorySelected: (directory: string[]) => void
}

export const DirectoryPicker: React.FC<DirectoryPickerProps> = ({
  onDirectorySelected,
}) => {
  const handlePickDirectory = async () => {
    const directory = await window.Main.openDirectoryPicker()
    if (directory) {
      onDirectorySelected([directory])
    }
  }

  return <button onClick={handlePickDirectory}>Pick Directory</button>
}
