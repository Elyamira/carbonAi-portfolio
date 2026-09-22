import styled from "styled-components";

export const Panel = styled.section`
  min-width: 0;
  padding: ${({ theme }) => theme.space[5]};
  background: ${({ theme }) => theme.color.card};
  border: 1px solid ${({ theme }) => theme.color.lineSoft};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

export const AnchorPanel = styled(Panel)`
  scroll-margin-top: ${({ theme }) => theme.space[4]};
`;
export const PanelHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
`;

export const Heading = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.lg};
  line-height: 1.25;
  font-weight: 650;
  color: ${({ theme }) => theme.color.ink};
`;

export const SubText = styled.p`
  max-width: 78ch;
  margin: ${({ theme }) => `${theme.space[1]} 0 ${theme.space[4]}`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.muted};
`;

export const FootNote = styled.p`
  max-width: 90ch;
  margin-top: ${({ theme }) => theme.space[3]};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.muted};
`;

/** For text that screen readers need and sighted users do not: "Details" becomes "Details for Kariba REDD+". */
export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;
