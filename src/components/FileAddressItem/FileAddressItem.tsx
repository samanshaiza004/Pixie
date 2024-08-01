import { ReactNode, ButtonHTMLAttributes } from 'react'

import { Container } from './styles'
import FileIcons from '../FileIcons'

type FileAddressItemProps = {
  fileName: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export function FileAddressItem(props: FileAddressItemProps) {
  const onClick = props.onClick
  return (
    <Container type="button" onClick={onClick}>
      {props.fileName}
    </Container>
  )
}
