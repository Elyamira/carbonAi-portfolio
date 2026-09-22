// Pure functions: (portfolio data) -> ECharts option. No React, no DOM, easy to test.
import { BAND_LABEL, BAND_ORDER } from "@/features/projects/model/record";
import { formatInteger, formatPercent, pluralize } from "@/shared/lib/format";
import type { Group, Portfolio } from "@/features/projects/model/portfolio";
import { color, sans } from "@/shared/theme/tokens";
import type { ChartOption } from "@/shared/charts/echarts";

const tooltip = {
  backgroundColor: color.card,
  borderColor: color.line,
  borderWidth: 1,
  padding: [8, 10],
  textStyle: { color: color.body, fontFamily: sans, fontSize: 12 },
  extraCssText: "box-shadow:0 18px 40px rgba(17,24,39,.08);border-radius:8px;",
};

/** Volume by rating band, as parts of one whole with the whole written in the middle. */
export function bandDonutOption(portfolio: Portfolio): ChartOption {
  // Plain fills from the brand tokens. Amber marks the lowest band, the teals carry the other two numeric bands,
  // and the two greys are for groups that are not on the numeric scale at all. The legend beside the donut names
  // each group in slice order, so colour is never the only cue.
  const fill = { under60: color.amber, from60to79: color.teal, from80: color.tealSoft, letter: color.muted, unrated: color.line };
  return {
    textStyle: { fontFamily: sans },
    title: {
      text: formatInteger(portfolio.total),
      subtext: `tCO2e, ${pluralize(portfolio.counted.length, "project")}`,
      left: "center",
      top: "38%",
      itemGap: 4,
      textStyle: { color: color.ink, fontSize: 24, fontWeight: 650 },
      subtextStyle: { color: color.muted, fontSize: 12 },
    },
    tooltip: {
      ...tooltip,
      trigger: "item",
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const group = portfolio.byBand[BAND_ORDER[item.dataIndex]];
        return `<b>${BAND_LABEL[BAND_ORDER[item.dataIndex]]}</b><br>${formatPercent(group.share)} of volume<br>${pluralize(group.count, "project")}, ${formatInteger(group.tonnes)} tCO2e`;
      },
    },
    series: [
      {
        type: "pie",
        radius: ["62%", "88%"],
        startAngle: 90,
        label: { show: false },
        emphasis: { scale: true, scaleSize: 4 },
        data: BAND_ORDER.map((band) => ({
          name: BAND_LABEL[band],
          value: portfolio.byBand[band].tonnes,
          // An empty band must not leave a stray sliver of border at twelve o'clock.
          itemStyle: { color: fill[band], borderColor: color.card, borderWidth: portfolio.byBand[band].tonnes === 0 ? 0 : 3 },
        })),
      },
    ],
  };
}

/** Volume by type, region or registry. One teal series; selecting a bar mutes the others. */
export function breakdownOption(groups: Group[], selected: string | null): ChartOption {
  return {
    textStyle: { fontFamily: sans },
    grid: { left: 4, right: 56, top: 4, bottom: 4 },
    tooltip: {
      ...tooltip,
      trigger: "item",
      formatter: (params) => {
        const group = groups[(Array.isArray(params) ? params[0] : params).dataIndex];
        return `<b>${group.key}</b><br>${formatInteger(group.tonnes)} tCO2e, ${formatPercent(group.share)} of volume<br>${pluralize(group.count, "project")}. Select to filter.`;
      },
    },
    xAxis: { type: "value", show: false, max: groups[0]?.tonnes ?? 1 },
    yAxis: {
      type: "category",
      inverse: true,
      data: groups.map((group) => group.key),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: color.body, fontSize: 13 },
    },
    series: [
      {
        type: "bar",
        barWidth: 16,
        barMinHeight: 3,
        cursor: "pointer",
        label: {
          show: true,
          position: "right",
          color: color.ink,
          fontWeight: 600,
          fontSize: 13,
          formatter: (params) => formatPercent(groups[params.dataIndex].share),
        },
        data: groups.map((group) => ({
          value: group.tonnes,
          itemStyle: { color: selected && selected !== group.key ? color.tealSoft : color.teal, borderRadius: [0, 4, 4, 0] },
        })),
      },
    ],
  };
}

/** Concentration: projects ranked largest first against their running share. Rank on the x axis, not time. */
export function concentrationOption(portfolio: Portfolio): ChartOption {
  const projectCount = portfolio.cumulative.length;
  return {
    textStyle: { fontFamily: sans },
    grid: { left: 4, right: 12, top: 12, bottom: 56 },
    legend: { bottom: 0, left: 0, itemWidth: 18, itemHeight: 2, textStyle: { color: color.muted, fontSize: 12 } },
    tooltip: {
      ...tooltip,
      trigger: "axis",
      formatter: (params) => {
        const index = (Array.isArray(params) ? params[0] : params).dataIndex;
        const entry = portfolio.cumulative[index];
        return `<b>Largest ${pluralize(index + 1, "project")}</b><br>hold ${formatPercent(entry.share)} of volume<br>Number ${index + 1}: ${entry.project.name}`;
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: portfolio.cumulative.map((_, index) => String(index + 1)),
      name: "Projects, largest first",
      nameLocation: "middle",
      nameGap: 28,
      nameTextStyle: { color: color.muted, fontSize: 12 },
      axisLabel: { color: color.muted, fontSize: 11 },
      axisLine: { lineStyle: { color: color.line } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 25,
      axisLabel: { color: color.muted, fontSize: 12, formatter: "{value}%" },
      splitLine: { lineStyle: { color: color.lineSoft } },
    },
    series: [
      {
        name: "This portfolio",
        type: "line",
        // Only the third point carries a label. A series-level label with an empty string still draws its background chip.
        data: portfolio.cumulative.map((entry, index) => {
          const value = +(entry.share * 100).toFixed(1);
          if (index !== 2) return value;
          return {
            value,
            symbolSize: 10,
            label: {
              show: true,
              position: "right" as const,
              distance: 8,
              formatter: `Top 3: ${formatPercent(portfolio.top3Share)}`,
              color: color.ink,
              fontWeight: 600,
              backgroundColor: color.card,
              padding: [4, 6],
              borderRadius: 6,
            },
          };
        }),
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: color.teal, width: 2 },
        itemStyle: { color: color.teal },
        areaStyle: { color: color.tealSoft },
        z: 1,
      },
      {
        name: "Evenly spread",
        type: "line",
        data: portfolio.cumulative.map((_, index) => +(((index + 1) / projectCount) * 100).toFixed(1)),
        symbol: "none",
        lineStyle: { color: color.muted, width: 1, type: "dashed" },
        itemStyle: { color: color.muted },
        z: 2,
        silent: true,
      },
    ],
  };
}
