import styled from 'styled-components'

export const Container = styled.button`
  height: 24px;
  padding: 0 12px;
  margin-right: 0px;

  display: flex;
  align-items: center;

  border-radius: 0px;
  border: 0;

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
    filter: brightness(0.9);
  }
`
