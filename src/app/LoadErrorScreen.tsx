import { isRouteErrorResponse, useRevalidator, useRouteError } from "react-router";
import { SmallButton } from "@/shared/ui/controls";
import { Screen } from "@/shared/ui/Screen";

/** Shown when the loader throws: the request failed, or the data is not in the expected shape. */
export function LoadErrorScreen() {
  const error = useRouteError();
  const { revalidate, state } = useRevalidator();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Something went wrong.";
  return (
    <Screen>
      <h1>The portfolio could not be loaded</h1>
      <p role="alert">{message}</p>
      <SmallButton type="button" onClick={() => revalidate()} disabled={state === "loading"}>
        {state === "loading" ? "Trying again…" : "Try again"}
      </SmallButton>
    </Screen>
  );
}
