import React, { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { useAudio } from '../../hooks/AudioContextProvider'

interface AudioPlayerProps {
  currentAudio: string | null
  volume: number
  setVolume: (volume: number) => void
  shouldReplay: boolean // New prop to handle replay behavior
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ shouldReplay }) => {
  const waveSurferRef = useRef<WaveSurfer | null>(null)
  const { currentAudio, playAudio, stopAudio, volume, setVolume } = useAudio()
  useEffect(() => {
    waveSurferRef.current?.setVolume(volume)
  }, [volume])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 64,
        width: '100%',
        backgroundColor: '#f8f8ff',
      }}
    >
      <span>currentAudio: {currentAudio}</span>
      <div id="waveform" />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span>Volume: </span>
        <input
          style={{ width: '30%', outline: 'none', opacity: 1 }}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

export default AudioPlayer
