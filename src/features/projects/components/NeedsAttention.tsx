import styled from "styled-components";

import { pluralize } from "@/shared/lib/format";
import type { Portfolio, Project } from "@/features/projects/model/portfolio";
import { SmallButton } from "@/shared/ui/controls";
import { AnchorPanel, Heading, PanelHead, SubText } from "@/shared/ui/layout";
import { Flagged, AttentionMark } from "./marks";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.fontSize.sm};

  th,
  td {
    padding: 9px 8px;
    border-bottom: 1px solid ${({ theme }) => theme.color.lineSoft};
    text-align: left;
    vertical-align: top;
    font-weight: 400;
  }

  thead th {
    font-size: ${({ theme }) => theme.fontSize.xs};
    color: ${({ theme }) => theme.color.muted};
  }

  tbody th {
    width: 30%;
    font-weight: 600;
    color: ${({ theme }) => theme.color.ink};
  }

  tbody th span {
    display: block;
    font-size: ${({ theme }) => theme.fontSize.xs};
    font-weight: 400;
    color: ${({ theme }) => theme.color.muted};
  }

  td > div {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.space[2]};
  }

  td > div > span {
    white-space: normal;
  }
`;

interface Props {
  portfolio: Portfolio;
  assumeUnit: boolean;
  onShowInTable: () => void;
}

/**
 * Records containing values that need an analyst's attention.
 *
 * The values are shown exactly as recorded. This component does not
 * decide whether a value is valid or how it should be interpreted;
 * that decision belongs to the portfolio model.
 */
export function NeedsAttention({ portfolio, assumeUnit, onShowInTable }: Props) {
  return (
    <AnchorPanel id="needs-attention" aria-labelledby="attention-heading">
      <PanelHead>
        <Heading id="attention-heading">
          Needs attention: {pluralize(portfolio.needsAttention.length, "record")} requiring an analyst decision
        </Heading>

        <SmallButton type="button" onClick={onShowInTable}>
          Show these in the table
        </SmallButton>
      </PanelHead>

      <SubText>
        Values are shown exactly as recorded.{" "}
        {assumeUnit
          ? "Unitless volumes are currently counted as tCO2e for the portfolio calculations."
          : "Unitless volumes are excluded from the portfolio calculations."}{" "}
        Prices are not aggregated because currencies differ and some are missing. Largest volume first.
      </SubText>

      <Table>
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th scope="col">Value as recorded, and what needs attention</th>
          </tr>
        </thead>

        <tbody>
          {portfolio.needsAttention.map((project) => (
            <ProjectAttentionRow key={project.id} project={project} />
          ))}
        </tbody>
      </Table>
    </AnchorPanel>
  );
}

function ProjectAttentionRow({ project }: { project: Project }) {
  const attentionNotes = project.readingNotes.filter((note) => note.requiresAttention);

  return (
    <tr>
      <th scope="row">
        {project.name}
        <span>{project.id}</span>
      </th>

      <td>
        <div>
          {attentionNotes.map((note) => (
            <Flagged key={note.field}>
              <AttentionMark aria-hidden="true" />
              {note.text}
            </Flagged>
          ))}
        </div>
      </td>
    </tr>
  );
}
