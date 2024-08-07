import { ReactNode, ButtonHTMLAttributes } from 'react'
import { Container } from './styles'
import FileIcons from '../FileIcons'

type FileItemProps = {
  fileName: string
  isDirectory: boolean
  location: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export function FileItem(props: FileItemProps) {
  const onClick = props.onClick
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    window.Main.startDrag(props.location)
  }
  return (
    <Container
      type="button"
      onClick={onClick}
      draggable={!props.isDirectory}
      onDragStart={handleDragStart}
    >
      <div>
        <FileIcons fileName={props.fileName} isDirectory={props.isDirectory} />
      </div>
      {props.fileName}
    </Container>
  )
}
