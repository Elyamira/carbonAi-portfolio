import type { ReactNode } from "react";
import { Flagged, AttentionMark } from "@/features/projects/components/marks";
import type { Project } from "@/features/projects/model/portfolio";
import { VisuallyHidden } from "@/shared/ui/layout";

interface Props {
  project: Project;
  field: "volume" | "price" | "updated";
  children: ReactNode;
}

export function Recorded({ project, field, children }: Props) {
  const note = project.readingNotes.find((note) => {
    if (!note.requiresAttention) return false;

    if (field === "volume") {
      return note.text.startsWith("Volume");
    }

    if (field === "price") {
      return note.text.startsWith("Price");
    }

    return note.text.startsWith("Date");
  });

  if (!note) return <>{children}</>;

  return (
    <Flagged title={note.text}>
      <AttentionMark aria-hidden="true" />
      {children}
      <VisuallyHidden> ({note.text})</VisuallyHidden>
    </Flagged>
  );
}
