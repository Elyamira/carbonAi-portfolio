# Notes

## Run it

Requires Node 20 or newer.

```
npm install
npm run dev        # http://localhost:5173
npm test           # 28 tests: schema, field parsers, reading notes, portfolio
npm run lint
npm run build      # type-checks, then builds to dist/
```

Stack: Vite, React 19, TypeScript (strict), React Router, styled-components, ECharts, TanStack Table 8, Zod.

This is a single-page app with client-side routes, so a server must return `index.html` for unknown paths. Vite's dev
and preview servers already do.

## Structure

```
public/data/projects.json         the 14 records, unchanged, fetched at runtime like an API response
src/
  app/                            composition root: entry, route tree, layout, whole-page screens
  features/projects/
    api/                          Zod schema (the RawProject type is inferred from it), fetch and validate
    model/                        pure domain logic: no React, no styling, no charts
      fields/                     one file per field: volume, rating, date, vintage, price
      reference.ts                region and registry lookups
      parseRecord.ts              1. read a record into structured values
      readingNotes.ts             2. explain it: every sentence, and the attention rule
      buildPortfolio.ts           3. decide what counts  4. aggregate
      aggregate.ts                generic arithmetic over anything with tonnes
      index.ts                    the model's public surface
    hooks/                        the route loader; URL-held filters and their vocabulary
    charts/                       ECharts options, built from the model
    components/  table/           the UI
    PortfolioPage.tsx             wiring: data in, one portfolio object, everything derives from it
    index.ts                      the feature's public surface
  shared/                         knows nothing about carbon projects: theme, ui, chart wrapper, lib
  test/                           test support
  types/                          declaration files only
```

Rules: `app` imports `features`, `features` import `shared`, never the reverse. Code outside a folder with an
`index.ts` imports that index and nothing deeper. Imports never go upwards (`../`). The model imports no UI code.

## Decisions

1. **Nothing is changed, and nothing is guessed.** Values are shown exactly as recorded. The model reads them into
   structured values and, whenever it had to interpret something, says so in a reading note under Details.
2. **The attention rule.** A value needs attention when it is missing something (a unit, a currency, a rating, a day)
   or can be read two ways (12/02/2023). A value that is complete but written differently (85 kt, verra, '23,
   €11.00/tCO2e) gets a quiet note instead. The Records filter splits the table on this rule: Needs attention, No issues.
3. **Only comparable values are aggregated.** Volume is added up; price and rating never are, because prices mix
   currencies and ratings mix two scales. They are shown as recorded and cannot be sorted.
4. **The unit choice.** Seven volumes have no unit. By default they are left out of every figure; the page-level
   control counts them as tCO2e. The choice is applied in exactly one function, `countedTonnes`.
5. **Rating bands.** Numeric ratings are grouped at 60 and 80 and named after the range ("Rated below 60"), not a
   verdict. Letter grades are their own group: the data does not say how letters relate to numbers.
6. **Region and registry** are display groupings derived from the data (VCS is Verra's programme; ACR is the American
   Carbon Registry), never new fields.
7. **Data fetching.** A React Router loader fetches the JSON once per page load and validates it with Zod. The data is
   assumed static for a session; TanStack Query was considered and would be the choice if it were not.
8. **Filters live in the URL,** so a filtered view can be bookmarked, shared and reloaded.

## What I would do next

- Confirm the 60 and 80 thresholds, and the attention rule, with the analysts who own the ratings.
- Validation at the source, so the needs-attention list becomes a backlog that shrinks.
- With a real API: per-deployment configuration for the URL, and TanStack Query if the data changes during a session.
- At 1,400 projects: server-side filtering and paging through the same TanStack state, and a virtualised table
