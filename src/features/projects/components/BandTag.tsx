import styled from "styled-components";

import { BAND_LABEL } from "@/features/projects/model/record";
import type { Band } from "@/features/projects/model/record";
import { Swatch } from "./marks";

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[2]};
  white-space: nowrap;
`;

/** The band's colour with its name beside it, so colour is never the only cue. */
export function BandTag({ band }: { band: Band }) {
  return (
    <Tag>
      <Swatch $band={band} aria-hidden="true" />
      {BAND_LABEL[band]}
    </Tag>
  );
}
