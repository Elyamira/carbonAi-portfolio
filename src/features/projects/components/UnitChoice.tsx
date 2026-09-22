import styled from "styled-components";
import type { Portfolio } from "@/features/projects/model/portfolio";
import { formatInteger, pluralize } from "@/shared/lib/format";
import { Segmented } from "@/shared/ui/controls";

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[5]}`};
  background: ${({ theme }) => theme.color.cream};
  border: 1px solid ${({ theme }) => theme.color.lineSoft};
  border-radius: ${({ theme }) => theme.radius.md};

  p {
    flex: 1 1 360px;
    font-size: ${({ theme }) => theme.fontSize.sm};
  }
  b {
    font-weight: 600;
    color: ${({ theme }) => theme.color.ink};
  }
`;

interface Props {
  portfolio: Portfolio;
  assumeUnit: boolean;
  onChange: (assumeUnit: boolean) => void;
}

/**
 * A page-level setting, so it sits above everything it changes: the cards, all three charts and the table's sorting.
 * Two named states instead of a checkbox, because "off" has to say what it does as plainly as "on".
 */
export function UnitChoice({ portfolio, assumeUnit, onChange }: Props) {
  return (
    <Bar role="group" aria-labelledby="unit-choice-label">
      <p>
        <b id="unit-choice-label">{pluralize(portfolio.unitlessCount, "volume")} are recorded with no unit</b> (
        {formatInteger(portfolio.unitlessTonnes)} if they are tCO2e). This choice changes every figure and chart on the page.
      </p>
      <Segmented>
        <button type="button" aria-pressed={!assumeUnit} onClick={() => onChange(false)}>
          Leave them out
        </button>
        <button type="button" aria-pressed={assumeUnit} onClick={() => onChange(true)}>
          Count them as tCO2e
        </button>
      </Segmented>
    </Bar>
  );
}
