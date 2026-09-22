import { BAND_LABEL } from "./record";
import type { Project } from "./portfolio";

/** A plain-text summary with every value exactly as recorded, ready to paste into a message or a ticket. */
export function projectAsText(project: Project): string {
  const { raw } = project;
  return [
    `${raw.id}  ${raw.name}`,
    `Rating band: ${BAND_LABEL[project.band]}`,
    `Type: ${raw.type} | Country: ${raw.country} | Registry: ${raw.registry} | Vintage: ${raw.vintage}`,
    `Volume: ${raw.volume} | Price: ${raw.price} | Rating: ${raw.rating === null ? "none" : raw.rating} | Updated: ${raw.updated}`,
    `Notes: ${raw.notes || "none recorded"}`,
    ...project.readingNotes.map((note) => `Reading note: ${note.text}`),
  ].join("\n");
}
