import ReactDOM from 'react-dom'
import { App } from './App'
import { AudioProvider } from './hooks/AudioContextProvider'

ReactDOM.render(
  <AudioProvider>
    <App />
  </AudioProvider>,
  document.getElementById('root')
)
