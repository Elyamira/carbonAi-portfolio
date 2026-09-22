// The composition root: the one place that knows which features exist and how they are routed.
// No JSX and no components in this file, only the route tree, so it is a plain .ts module and React Fast Refresh
// keeps working for every component file it points to.
import { createBrowserRouter } from "react-router";
import { PortfolioPage, PROJECTS_ROUTE_ID, projectsLoader } from "@/features/projects";
import { AppLayout } from "./AppLayout";
import { LoadErrorScreen } from "./LoadErrorScreen";
import { LoadingScreen } from "./LoadingScreen";
import { NotFoundScreen } from "./NotFoundScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      {
        // A pathless route that owns the data. Its loading and error screens render inside AppLayout's Outlet,
        // so the header stays visible and is written once.
        id: PROJECTS_ROUTE_ID,
        loader: projectsLoader,
        // React Router re-runs loaders whenever the search params change, and the filters live in the search params,
        // so every keystroke in the search box would re-fetch the data. Re-run only when the URL is unchanged,
        // which is what an explicit revalidate() (the "Try again" button) looks like.
        shouldRevalidate: ({ currentUrl, nextUrl }) => currentUrl.href === nextUrl.href,
        HydrateFallback: LoadingScreen,
        ErrorBoundary: LoadErrorScreen,
        children: [{ index: true, Component: PortfolioPage }],
      },
      { path: "*", Component: NotFoundScreen },
    ],
  },
]);
