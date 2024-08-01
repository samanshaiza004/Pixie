import styled from 'styled-components'

export const Container = styled.button`
  height: 32px;
  padding: 0 12px;
  gap: 6px;

  display: flex;
  align-items: center;

  border-radius: 2px;
  border: 0;

  color: black;
  font-size: 1em;
  font-weight: 500;

  cursor: pointer;
  transition: filter 0.08s ease-in-out;
  &:hover {
    filter: brightness(0.95);
  }

  &:active {
    filter: brightness(0.7);
  }
`
