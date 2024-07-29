import styled from 'styled-components'

export const Container = styled.button`
  height: 42px;
  padding: 0 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;
  border: 0;

  color: #fff;
  font-size: 16px;
  font-weight: bold;

  cursor: pointer;

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.7);
  }
`
