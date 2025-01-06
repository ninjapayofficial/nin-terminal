// app/components/ChartSection.tsx
"use client";

import React, { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  BarData,
} from "lightweight-charts";

interface Candle {
  time: string; // 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartSectionProps {
  symbol: string;
  data: Candle[];
}

/** Renders a candlestick chart using Lightweight Charts */
export default function ChartSection({ symbol, data }: ChartSectionProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart only once
    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        layout: {
          background: { color: "#0b0e11" },
          textColor: "#e0e0e0",
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        timeScale: { borderColor: "#2f3336", barSpacing: 6 },
        rightPriceScale: { borderColor: "#2f3336" },
        grid: {
          vertLines: { color: "#2f3336" },
          horzLines: { color: "#2f3336" },
        },
      });
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: "#2DBD85",
        downColor: "#F6465D",
        borderUpColor: "#26a69a",
        borderDownColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });
    }

    return () => {
      // Cleanup if needed
      // chartRef.current?.remove(); // optional
    };
  }, []);

  // Whenever data changes, update the chart
  useEffect(() => {
    if (!seriesRef.current) return;

    // Convert date string to UTCTimestamp if needed
    const chartData = data.map((d) => ({
      time: d.time as unknown as UTCTimestamp, // or parse to number if "YYYY-MM-DD"
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    seriesRef.current.setData(chartData);
  }, [data]);

  // On window resize, adjust chart size
  useEffect(() => {
    function handleResize() {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
