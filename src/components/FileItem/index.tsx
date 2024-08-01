import { ReactNode, ButtonHTMLAttributes } from 'react'

import { Container } from './styles'
import FileIcons from '../FileIcons'

type FileItemProps = {
  fileName: string
  isDirectory: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export function FileItem(props: FileItemProps) {
  const onClick = props.onClick
  return (
    <Container type="button" onClick={onClick}>
      <div>
        <FileIcons fileName={props.fileName} isDirectory={props.isDirectory} />
      </div>
      {props.fileName}
    </Container>
  )
}
