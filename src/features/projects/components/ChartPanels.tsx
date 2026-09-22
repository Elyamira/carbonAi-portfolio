import { useMemo } from "react";
import styled from "styled-components";
import { Swatch } from "./marks";
import { bandDonutOption, breakdownOption, concentrationOption } from "@/features/projects/charts/chartOptions";
import { BAND_LABEL, BAND_ORDER } from "@/features/projects/model/record";
import type { Band } from "@/features/projects/model/record";
import { EChart } from "@/shared/charts/EChart";
import { formatPercent, pluralize } from "@/shared/lib/format";
import { Select } from "@/shared/ui/controls";
import { Heading, Panel, SubText } from "@/shared/ui/layout";
import { type Portfolio, groupBy } from "../model/portfolio";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.space[5]};
  align-items: stretch;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const LegendRow = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[2]};
  width: 100%;
  padding: ${({ theme }) => `6px ${theme.space[3]}`};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: none;
  text-align: left;

  b {
    font-weight: 600;
    color: ${({ theme }) => theme.color.ink};
  }
  .share {
    margin-left: auto;
    font-size: ${({ theme }) => theme.fontSize.md};
    font-weight: 650;
    color: ${({ theme }) => theme.color.ink};
  }
  .count {
    width: 96px;
    text-align: right;
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.color.muted};
  }
  &:hover {
    background: ${({ theme }) => theme.color.bg};
    border-color: ${({ theme }) => theme.color.lineSoft};
  }
  &[aria-pressed="true"] {
    background: ${({ theme }) => theme.color.tealSoft};
  }
`;

const TitleWithSelect = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
`;

export type Dimension = "type" | "region" | "registry";
const DIMENSIONS: { id: Dimension; label: string }[] = [
  { id: "type", label: "project type" },
  { id: "region", label: "region" },
  { id: "registry", label: "registry" },
];

interface Props {
  portfolio: Portfolio;
  dimension: Dimension;
  onDimensionChange: (dimension: Dimension) => void;
  selectedBand: string | null;
  selectedGroup: string | null;
  onPickBand: (band: Band) => void;
  onPickGroup: (groupKey: string) => void;
}

/** Three charts, three questions: how is the volume rated, where does it sit, how concentrated is it. */
export function ChartPanels({ portfolio, dimension, onDimensionChange, selectedBand, selectedGroup, onPickBand, onPickGroup }: Props) {
  const groups = useMemo(() => groupBy(portfolio.counted, (project) => project[dimension], portfolio.total), [portfolio, dimension]);
  // Memoised so the chart wrapper only redraws when its data really changed.
  const donut = useMemo(() => bandDonutOption(portfolio), [portfolio]);
  const breakdown = useMemo(() => breakdownOption(groups, selectedGroup), [groups, selectedGroup]);
  const concentration = useMemo(() => concentrationOption(portfolio), [portfolio]);

  return (
    <Grid>
      <Panel aria-labelledby="rating-heading">
        <Heading id="rating-heading">Volume by rating</Heading>
        <SubText>
          Numeric ratings are grouped at 60 and 80. Letter grades are a different scale, so they are grouped as recorded. Select a group to
          filter the table.
        </SubText>
        <EChart
          option={donut}
          height={190}
          label={`Donut of volume by rating band: ${BAND_ORDER.map((band) => `${BAND_LABEL[band]} ${formatPercent(portfolio.byBand[band].share)}`).join(", ")}`}
          onPick={(index) => onPickBand(BAND_ORDER[index])}
        />
        <div>
          {BAND_ORDER.map((band) => {
            const countedInBand = portfolio.byBand[band].count;
            const allInBand = portfolio.projectsInBand[band].length;
            return (
              <LegendRow key={band} type="button" aria-pressed={selectedBand === band} onClick={() => onPickBand(band)}>
                <Swatch $band={band} aria-hidden="true" />
                <b>{BAND_LABEL[band]}</b>
                <span className="share">{formatPercent(portfolio.byBand[band].share)}</span>
                {/* "0 of 1 counted" is honest where "0 projects" would not be. */}
                <span className="count">
                  {countedInBand === allInBand ? pluralize(countedInBand, "project") : `${countedInBand} of ${allInBand} counted`}
                </span>
              </LegendRow>
            );
          })}
        </div>
      </Panel>

      <Panel aria-labelledby="volume-by-heading">
        <TitleWithSelect>
          <Heading id="volume-by-heading">Volume by</Heading>
          <Select
            aria-labelledby="volume-by-heading"
            value={dimension}
            onChange={(event) => onDimensionChange(event.target.value as Dimension)}
          >
            {DIMENSIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </TitleWithSelect>
        <SubText>
          Select a bar to filter the table.
          {dimension === "region" && " Region is assigned from country."}
          {dimension === "registry" && " VCS is counted as Verra, American Carbon Registry as ACR."}
        </SubText>
        <EChart
          option={breakdown}
          height={groups.length * 32 + 12}
          label={`Volume by ${dimension}: ${groups.map((group) => `${group.key} ${formatPercent(group.share)}`).join(", ")}`}
          onPick={(index) => onPickGroup(groups[index].key)}
        />
      </Panel>

      <Panel aria-labelledby="concentration-heading">
        <Heading id="concentration-heading">Concentration</Heading>
        <SubText>
          The three largest projects hold {formatPercent(portfolio.top3Share)} of volume. The further the line sits above the dashed one,
          the more the portfolio depends on a few projects.
        </SubText>
        <EChart
          option={concentration}
          height={250}
          label={`Running share of volume with projects ranked largest first: ${portfolio.cumulative
            .slice(0, 5)
            .map((entry, index) => `top ${index + 1} ${formatPercent(entry.share)}`)
            .join(", ")}`}
        />
      </Panel>
    </Grid>
  );
}
