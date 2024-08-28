import React from 'react'
import { Container } from './styles'
import { IAudioMetadata } from 'music-metadata'
interface MetadataDisplayProps {
  metadata: IAudioMetadata
}

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ metadata }) => {
  if (!metadata) {
    return <Container>No metadata found</Container>
  }
  return (
    <Container>
      <h3>Metadata</h3>
      <p>Title: {metadata.common.title || 'Unknown'}</p>
      <p>Artist: {metadata.common.artist || 'Unknown'}</p>
      <p>Date: {metadata.common.date || 'Unknown'}</p>
      <p>
        Duration:{' '}
        {metadata.format.duration
          ? metadata.format.duration.toFixed(2) + ' seconds'
          : 'Unknown'}
      </p>
    </Container>
  )
}

export default MetadataDisplay
