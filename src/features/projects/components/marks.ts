// The small styled marks that belong to this feature: they know what a rating band and a data gap are.
// Styled elements only, no function components, so this stays a plain .ts module (see BandTag.tsx and RatingText.tsx).
import styled from "styled-components";
import { bandColour } from "./bandColour";
import type { Band } from "@/features/projects/model/record";

/** A rating band is a square. */
export const Swatch = styled.i<{ $band: Band }>`
  display: inline-block;
  flex: none;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${({ $band }) => bandColour[$band]};
`;

/** A data gap is a circle, so it is never mistaken for a rating band. */
export const AttentionMark = styled.i`
  display: inline-block;
  flex: none;
  width: 9px;
  height: 9px;
  margin-right: ${({ theme }) => theme.space[2]};
  border-radius: 50%;
  background: ${({ theme }) => theme.color.amber};
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color.body};
`;

/** A value that cannot be used as recorded. Cream is the brand's "special context" surface, used nowhere else in tables. */
export const Flagged = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px 8px 1px 6px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.color.cream};
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color.amber};
  color: ${({ theme }) => theme.color.ink};
  white-space: nowrap;
`;
