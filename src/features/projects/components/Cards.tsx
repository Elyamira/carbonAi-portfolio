import styled from "styled-components";
import type { Portfolio } from "@/features/projects/model/portfolio";
import { formatInteger, formatPercent, pluralize } from "@/shared/lib/format";
import { LinkButton } from "@/shared/ui/controls";
import { Panel } from "@/shared/ui/layout";

const Row = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.space[5]};

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    gap: ${({ theme }) => theme.space[4]};
  }
`;

const Card = styled(Panel).attrs({ as: "div" })<{ $attention?: boolean }>`
  padding: ${({ theme }) => `${theme.space[4]} ${theme.space[5]} ${theme.space[5]}`};
  /* Cream marks the one card that asks for action. */
  background: ${({ theme, $attention }) => ($attention ? theme.color.cream : theme.color.card)};

  dt {
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.color.muted};
  }
  dd {
    font-size: ${({ theme }) => theme.fontSize.sm};
  }
  dd.figure {
    margin: 2px 0 ${({ theme }) => theme.space[2]};
    font-size: ${({ theme }) => theme.fontSize.xl};
    line-height: 1.2;
    font-weight: 650;
    color: ${({ theme }) => theme.color.ink};
  }
  dd.figure small {
    font-size: ${({ theme }) => theme.fontSize.md};
    font-weight: 500;
    color: ${({ theme }) => theme.color.muted};
  }
  dd.aside {
    margin-top: ${({ theme }) => theme.space[2]};
    font-size: ${({ theme }) => theme.fontSize.xs};
    color: ${({ theme }) => theme.color.muted};
  }
`;

/** Neutral on purpose: being the largest project is a fact, not a warning, so no amber here. */
const ProjectChip = styled.button`
  display: grid;
  gap: 2px;
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.color.line};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.color.bg};
  text-align: left;
  color: ${({ theme }) => theme.color.ink};

  b {
    font-weight: 600;
  }
  span {
    font-size: ${({ theme }) => theme.fontSize.xs};
    color: ${({ theme }) => theme.color.body};
  }
  &:hover {
    border-color: ${({ theme }) => theme.color.tealDark};
  }
`;

interface Props {
  portfolio: Portfolio;
  assumeUnit: boolean;
  onShowProject: (projectId: string) => void;
  onReviewGaps: () => void;
}

/** One figure per card, each with the sentence that qualifies it. */
export function Cards({ portfolio, assumeUnit, onShowProject, onReviewGaps }: Props) {
  // The largest project follows the unit choice: among everything when unitless volumes are counted,
  // among the volumes that state a unit when they are left out.
  const largest = portfolio.largest;

  return (
    <Row>
      <Card>
        <dt>Total volume</dt>
        <dd className="figure">
          {formatInteger(portfolio.total)} <small>tCO2e</small>
        </dd>
        <dd>
          {portfolio.counted.length === portfolio.rows.length
            ? `All ${portfolio.rows.length}`
            : `${portfolio.counted.length} of ${portfolio.rows.length}`}{" "}
          projects.{" "}
          {assumeUnit
            ? `Includes ${pluralize(portfolio.unitlessCount, "volume")} recorded with no unit, counted as tCO2e.`
            : `${pluralize(portfolio.unitlessCount, "volume")} with no unit ${portfolio.unitlessCount === 1 ? "is" : "are"} left out.`}
        </dd>
      </Card>

      <Card>
        <dt>Largest project by volume</dt>
        <dd className="figure">{largest?.share != null ? formatPercent(largest.share) : "n/a"}</dd>

        {largest && (
          <dd>
            <ProjectChip type="button" onClick={() => onShowProject(largest.id)} aria-label={`Show ${largest.name} in the table`}>
              <b>{largest.name}</b>
              <span>
                Volume {largest.raw.volume}
                {assumeUnit && largest.volumeStatus === "unitless" ? " (no unit, counted as tCO2e)" : ""}.
              </span>
            </ProjectChip>
          </dd>
        )}

        <dd className="aside">The three largest hold {formatPercent(portfolio.top3Share)} of the total.</dd>

        {portfolio.largestExcluded && (
          <dd className="aside">
            {portfolio.largestExcluded.name} records a larger number, {portfolio.largestExcluded.raw.volume}, but with no unit, so it is not
            ranked here.
          </dd>
        )}
      </Card>

      <Card $attention>
        <dt>Records needing attention</dt>
        <dd className="figure">
          {portfolio.needsAttention.length} <small>of {portfolio.rows.length}</small>
        </dd>
        <dd>
          Values that need an analyst decision before they can be safely interpreted.
          <LinkButton type="button" onClick={onReviewGaps}>
            Review them
          </LinkButton>
        </dd>
      </Card>
    </Row>
  );
}
