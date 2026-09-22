import { Link } from "react-router";
import { Screen } from "@/shared/ui/Screen";

export function NotFoundScreen() {
  return (
    <Screen>
      <h1>Page not found</h1>
      <Link to="/">Back to the portfolio</Link>
    </Screen>
  );
}
