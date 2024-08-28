import styled from 'styled-components'

export const Container = styled.button`
  height: 32px;
  padding: 0 10px;
  gap: 6px;

  display: flex;
  align-items: center;

  width: 100%;

  border-radius: 2px;
  border: 1px solid #ddd;

  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

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

export const Span = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: filter 0.08s ease-in-out;
  &:hover {
    padding-bottom: calc(1em - 14px);
  }
`
