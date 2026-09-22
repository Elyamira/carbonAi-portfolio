// The API contract, written once. The schema checks the data at runtime, and the TypeScript type is derived
// from it, so the two cannot drift apart: change the schema and every consumer is re-checked by the compiler.
import { z } from "zod";

export const rawProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  registry: z.string(),
  country: z.string(),
  type: z.string(),
  vintage: z.string(),
  // Kept as recorded strings on purpose: "85 kt", "45000" and "€11.00/tCO2e" are parsed later, in model/portfolio.ts.
  volume: z.string(),
  price: z.string(),
  rating: z.union([z.number(), z.string(), z.null()]),
  updated: z.string(),
  notes: z.string(),
});

export const rawProjectsSchema = z.array(rawProjectSchema);

export type RawProject = z.infer<typeof rawProjectSchema>;
