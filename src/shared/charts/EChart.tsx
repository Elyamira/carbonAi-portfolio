import { useEffect, useEffectEvent, useRef } from "react";
import type { EChartsType } from "echarts/core";
import { echarts } from "./echarts";
import type { ChartOption } from "./echarts";

interface Props {
  option: ChartOption;
  height: number;
  /** Text alternative: say what the chart shows, with the headline numbers. */
  label: string;
  onPick?: (dataIndex: number) => void;
}

export function EChart({ option, height, label, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);

  // The chart is created once, but onPick is a new function on every render of the parent.
  // An Effect Event always sees the latest onPick without being a dependency of the effect below,
  // so a parent re-render never tears the chart down and rebuilds it. (React 19.2 or later.)
  const handlePick = useEffectEvent((dataIndex: number) => onPick?.(dataIndex));

  // Create once, dispose on unmount. ResizeObserver keeps the canvas in step with its card.
  useEffect(() => {
    if (!containerRef.current) return;
    const chartInstance = echarts.init(containerRef.current);
    chartRef.current = chartInstance;
    chartInstance.on("click", (event) => {
      if (event.componentType === "series" && typeof event.dataIndex === "number") handlePick(event.dataIndex);
    });
    const resizeObserver = new ResizeObserver(() => chartInstance.resize());
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      chartInstance.dispose();
      chartRef.current = null;
    };
  }, []);

  // A new option object means new data or a new selection: replace, do not merge.
  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={containerRef} role="img" aria-label={label} style={{ width: "100%", height }} />;
}
