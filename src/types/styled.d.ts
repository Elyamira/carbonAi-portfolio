import "styled-components";
import type { AppTheme } from "@/shared/theme/theme";

// Makes `theme.color.teal` autocomplete inside every styled component, and makes a typo fail the build.
declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
