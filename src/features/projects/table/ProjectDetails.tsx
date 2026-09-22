import { useState } from "react";
import styled from "styled-components";
import { AttentionMark } from "@/features/projects/components/marks";
import type { Project } from "@/features/projects/model/portfolio";
import { projectAsText } from "@/features/projects/model/projectAsText";
import { copyText } from "@/shared/lib/copyText";
import { SmallButton } from "@/shared/ui/controls";
import { VisuallyHidden } from "@/shared/ui/layout";

const Wrap = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 4fr) auto;
  gap: ${({ theme }) => theme.space[6]};
  padding: ${({ theme }) => `${theme.space[4]} ${theme.space[2]} ${theme.space[5]}`};
  white-space: normal;

  h4 {
    margin-bottom: ${({ theme }) => theme.space[1]};
    font-size: ${({ theme }) => theme.fontSize.xs};
    font-weight: 650;
    color: ${({ theme }) => theme.color.muted};
  }
  p {
    max-width: 64ch;
  }
  li {
    display: flex;
    align-items: baseline;
    padding: 2px 0;
  }
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.space[4]};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
  min-width: 120px;

  @media (max-width: 960px) {
    flex-direction: row;
  }
`;

/** The expanded sub-row: the analyst's own notes, and how the dashboard read any value that was not in a standard form. */
export function ProjectDetails({ project }: { project: Project }) {
  const [copied, setCopied] = useState<"id" | "details" | null>(null);
  const copy = async (what: "id" | "details") => {
    const succeeded = await copyText(what === "id" ? project.id : projectAsText(project));
    if (!succeeded) return;
    setCopied(what);
    window.setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Wrap>
      <div>
        <h4>Analyst notes</h4>
        <p>{project.raw.notes || "No notes recorded for this project."}</p>
      </div>
      <div>
        <h4>How the dashboard read this record</h4>
        {project.readingNotes.length > 0 ? (
          <ul>
            {project.readingNotes.map((note) => (
              <li key={note.text}>
                {note.requiresAttention && <AttentionMark aria-hidden="true" />}
                <span>{note.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Every value is in a standard form. Nothing was interpreted.</p>
        )}
      </div>
      <Actions>
        <SmallButton type="button" onClick={() => copy("id")}>
          {copied === "id" ? "Copied" : "Copy ID"}
        </SmallButton>
        <SmallButton type="button" onClick={() => copy("details")}>
          {copied === "details" ? "Copied" : "Copy details"}
        </SmallButton>
        <VisuallyHidden role="status">
          {copied ? `${copied === "id" ? "Project ID" : "Project details"} copied to the clipboard` : ""}
        </VisuallyHidden>
      </Actions>
    </Wrap>
  );
}
