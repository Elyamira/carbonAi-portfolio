// The app layer imports from here and nowhere deeper,
// so everything else in this folder is free to change without breaking the router.
export { PortfolioPage } from "./PortfolioPage";
export { PROJECTS_ROUTE_ID, projectsLoader } from "./hooks/useProjects";
