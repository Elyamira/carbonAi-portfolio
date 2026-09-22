import type { ReactNode } from "react";
import styled from "styled-components";

const Wrap = styled.main`
  display: grid;
  gap: ${({ theme }) => theme.space[3]};
  justify-items: start;
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.space[7]} ${theme.space[5]}`};

  h1 {
    font-size: ${({ theme }) => theme.fontSize.xl};
    line-height: 1.15;
    font-weight: 700;
    color: ${({ theme }) => theme.color.ink};
  }
  a {
    color: ${({ theme }) => theme.color.tealDark};
    text-underline-offset: 3px;
  }
`;

/** The frame for the whole-page states: loading, load error, not found. */
export function Screen({ busy = false, children }: { busy?: boolean; children: ReactNode }) {
  return <Wrap aria-busy={busy || undefined}>{children}</Wrap>;
}
