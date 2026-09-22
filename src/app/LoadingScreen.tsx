import { Screen } from "@/shared/ui/Screen";

/** Shown in the layout's Outlet while the projects loader is still running on first load. */
export function LoadingScreen() {
  return (
    <Screen busy>
      <p role="status">Loading the portfolio…</p>
    </Screen>
  );
}
