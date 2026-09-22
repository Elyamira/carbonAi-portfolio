import styled from "styled-components";
import type { Project } from "@/features/projects/model/portfolio";

const Quiet = styled.span`
  color: ${({ theme }) => theme.color.muted};
`;

/** The rating exactly as recorded. "pending" and null are shown muted, not dressed up as a score. */
export function RatingText({ project }: { project: Project }) {
  if (project.rating.scale === "unrated") return <Quiet>{project.raw.rating === null ? "none" : String(project.raw.rating)}</Quiet>;
  return <>{String(project.raw.rating)}</>;
}
