import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background: ${({ theme }) => theme.color.bg};
    color: ${({ theme }) => theme.color.body};
    font-family: ${({ theme }) => theme.font.sans};
    font-size: ${({ theme }) => theme.fontSize.base};
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, p, dl, dd, ul, ol { margin: 0; padding: 0; }
  ul, ol { list-style: none; }
  button, input, select { font: inherit; color: inherit; }
  button { cursor: pointer; }
  /* Selected text stays readable: soft teal behind ink, not the browser's dark default over muted text. */
  ::selection { background: ${({ theme }) => theme.color.tealSoft}; color: ${({ theme }) => theme.color.ink}; }
  :focus-visible { outline: 2px solid ${({ theme }) => theme.color.teal}; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
`;
