import { useRouteLoaderData } from "react-router";
import { getProjects } from "@/features/projects/api/getProjects";
import type { RawProject } from "@/features/projects/api/projectSchema";

/** The route id the app router must give to the route that carries `projectsLoader`. */
export const PROJECTS_ROUTE_ID = "projects";

/** Route loader. request.signal aborts the fetch if the user navigates away before it finishes. */
export const projectsLoader = ({ request }: { request: Request }) => getProjects(request.signal);

/** Any component under that route reads the loaded projects with this hook. */
export function useProjects(): RawProject[] {
  return useRouteLoaderData(PROJECTS_ROUTE_ID) as RawProject[];
}
