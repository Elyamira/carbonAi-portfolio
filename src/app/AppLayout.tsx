import { Link, Outlet } from "react-router";
import styled, { ThemeProvider } from "styled-components";
import logo from "@/shared/assets/carbonai-logo.png";
import { GlobalStyle } from "@/shared/theme/GlobalStyle";
import { theme } from "@/shared/theme/theme";

const SkipLink = styled.a`
  position: absolute;
  left: ${({ theme }) => theme.space[4]};
  top: -60px;
  z-index: 30;
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.color.teal};
  color: ${({ theme }) => theme.color.card};
  &:focus {
    top: ${({ theme }) => theme.space[3]};
  }
`;

/** The wordmark is black on transparent, so the bar has to be light. */
const Header = styled.header`
  background: ${({ theme }) => theme.color.card};
  border-bottom: 1px solid ${({ theme }) => theme.color.lineSoft};

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.space[4]};
    max-width: 1280px;
    margin: 0 auto;
    padding: ${({ theme }) => `${theme.space[3]} ${theme.space[5]}`};
  }
  img {
    display: block;
    height: 40px;
    width: auto;
  }
  p {
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.color.muted};
  }
`;

/** Theme, global styles and the header, once. Every route renders in the Outlet, including the loading and error screens. */
export function AppLayout() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SkipLink href="#main">Skip to the main content</SkipLink>
      <Header>
        <div>
          <Link to="/" aria-label="CarbonAI portfolio, home">
            <img src={logo} alt="CarbonAI" />
          </Link>
          <p>Project portfolio, internal use</p>
        </div>
      </Header>
      <div id="main">
        <Outlet />
      </div>
    </ThemeProvider>
  );
}
