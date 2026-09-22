// Buttons, inputs and filters. Interactive means teal; selected means soft teal with ink text.
import styled from "styled-components";

/** Text-style button. Teal-dark, because plain teal text on the page background falls just under 4.5:1. */
export const LinkButton = styled.button`
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  font-weight: inherit;
  color: ${({ theme }) => theme.color.tealDark};
  text-decoration: underline;
  text-decoration-color: ${({ theme }) => theme.color.tealSoft};
  text-underline-offset: 3px;
  &:hover {
    text-decoration-color: currentColor;
  }
`;

export const SmallButton = styled.button`
  padding: 5px 14px;
  border: 1px solid ${({ theme }) => theme.color.line};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.color.card};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.body};
  white-space: nowrap;
  &:hover {
    border-color: ${({ theme }) => theme.color.tealDark};
    color: ${({ theme }) => theme.color.tealDark};
  }
`;

/** A visible label above its control. Placeholders are hints, not labels. */
export const Field = styled.label`
  display: grid;
  gap: 3px;
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.muted};
`;

export const SearchInput = styled.input`
  width: 260px;
  max-width: 100%;
  padding: 7px 14px;
  border: 1px solid ${({ theme }) => theme.color.line};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.color.card};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.ink};
  &::placeholder {
    color: ${({ theme }) => theme.color.muted};
  }
  &:focus-visible {
    border-color: ${({ theme }) => theme.color.teal};
  }
`;

export const Select = styled.select`
  padding: 7px 12px;
  border: 1px solid ${({ theme }) => theme.color.line};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.color.card};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.body};
  &:hover {
    border-color: ${({ theme }) => theme.color.tealDark};
  }
  /* A filter that is doing something looks selected, like every other selected control. */
  &[data-active="true"] {
    background: ${({ theme }) => theme.color.tealSoft};
    border-color: ${({ theme }) => theme.color.teal};
    color: ${({ theme }) => theme.color.ink};
    font-weight: 600;
  }
`;

/** A row of mutually exclusive buttons. Give each button aria-pressed. */
export const Segmented = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 3px;
  background: ${({ theme }) => theme.color.bgAlt};
  border: 1px solid ${({ theme }) => theme.color.line};
  border-radius: ${({ theme }) => theme.radius.pill};

  button {
    padding: 4px 12px;
    border: 0;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: transparent;
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.color.body};
  }
  button:hover {
    background: ${({ theme }) => theme.color.card};
  }
  button[aria-pressed="true"] {
    background: ${({ theme }) => theme.color.tealSoft};
    color: ${({ theme }) => theme.color.ink};
    font-weight: 600;
  }
`;

/** An active filter, removable. */
export const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[2]};
  margin-right: ${({ theme }) => theme.space[2]};
  padding: 2px 10px;
  border: 1px solid ${({ theme }) => theme.color.teal};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.color.tealSoft};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.ink};
  &:hover {
    background: ${({ theme }) => theme.color.card};
  }
`;
