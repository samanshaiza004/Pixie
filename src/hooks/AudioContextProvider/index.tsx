import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import WaveSurfer from 'wavesurfer.js'

interface AudioContextProps {
  currentAudio: string | null
  playAudio: (filepath: string) => void
  stopAudio: () => void
  volume: number
  setVolume: (volume: number) => void
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined)

export const AudioProvider: React.FC = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)
  const waveSurferRef = useRef<WaveSurfer | null>(null)

  const playAudio = (filePath: string) => {
    if (waveSurferRef.current) {
      waveSurferRef.current?.load(filePath)
    }
  }

  useEffect(() => {
    waveSurferRef.current = WaveSurfer.create({
      container: document.getElementById('waveform') as HTMLDivElement,
      waveColor: 'white',
      progressColor: '#433fc4',
      barWidth: 4,
      barRadius: 30,
      barHeight: 4,
      height: 64,
    })
    if (waveSurferRef.current) {
      waveSurferRef.current.setVolume(volume)

      waveSurferRef.current.on('ready', () => waveSurferRef.current?.play())
      waveSurferRef.current.on('click', () => waveSurferRef.current?.play())
    }
  }, [])

  useEffect(() => {
    waveSurferRef.current?.setVolume(volume)
  }, [volume])

  const stopAudio = () => {
    waveSurferRef.current?.stop()
    setCurrentAudio(null)
  }

  return (
    <AudioContext.Provider
      value={{ currentAudio, playAudio, stopAudio, volume, setVolume }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within a AudioProvider')
  }
  return context
}
