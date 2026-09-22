import { color } from "@/shared/theme/tokens";
import type { Band } from "@/features/projects/model/record";

/**
 * One plain colour per rating band, all from existing tokens, used by the table swatches and the donut alike so they
 * can never disagree. Amber marks the lowest band, the teals carry the other two numeric bands, and the two greys are
 * for groups that are not on the numeric scale at all. Colour is never the only cue: a label always sits beside it.
 */
export const bandColour: Record<Band, string> = {
  under60: color.amber,
  from60to79: color.teal,
  from80: color.tealSoft,
  letter: color.muted,
  unrated: color.line,
};
