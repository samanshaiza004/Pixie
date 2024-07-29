import { Button } from '../Button'
import { Container, Image, Text } from './styles'

export function Greetings() {
  let amIDir = window.Main.isDirectory('./')
  console.log(amIDir)
  function handleSayHello() {}

  return (
    <Container>
      <Image
        src="https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg"
        alt="ReactJS logo"
      />
      <Text>
        An Electron boilerplate including TypeScript, React, Jest and ESLint.
      </Text>
      <Text>{amIDir}</Text>
      <Button onClick={handleSayHello}>Send message to main process</Button>
    </Container>
  )
}
