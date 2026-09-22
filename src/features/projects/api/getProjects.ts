import { rawProjectsSchema } from "./projectSchema";
import type { RawProject } from "./projectSchema";

// BASE_URL is built into Vite ("/" by default), so this keeps working if the app is served from a sub-path.
// With a real backend, this line becomes the API endpoint and nothing else in the app changes.
const PROJECTS_URL = `${import.meta.env.BASE_URL}data/projects.json`;

/** Fetch, then validate at the boundary. Past this function the rest of the app can trust the RawProject type. */
export async function getProjects(signal?: AbortSignal): Promise<RawProject[]> {
  const response = await fetch(PROJECTS_URL, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`The projects could not be loaded (HTTP ${response.status}).`);

  const parsed = rawProjectsSchema.safeParse(await response.json());
  if (!parsed.success) {
    // Name the first problem precisely: which record, which field, what was wrong.
    const issue = parsed.error.issues[0];
    const where = issue.path.map((part) => (typeof part === "number" ? `[${part}]` : `.${String(part)}`)).join("");
    throw new Error(`The projects data is not in the expected shape: projects${where}, ${issue.message.toLowerCase()}.`);
  }
  return parsed.data;
}
