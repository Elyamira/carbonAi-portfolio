import { color, fontSize, radius, sans, shadow, space } from "./tokens";

/** The styled-components theme. Components never write a hex value: they ask the theme for a token. */
export const theme = { color, radius, shadow, space, fontSize, font: { sans } } as const;

export type AppTheme = typeof theme;
