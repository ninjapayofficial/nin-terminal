// app/components/AdvancedChart.tsx
"use client";

import React, { useRef, useEffect } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CrosshairMode,
  LineStyle,
  UTCTimestamp,
} from "lightweight-charts";

interface Candle {
  time: string;  // e.g. 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AdvancedChartProps {
  data: Candle[];      // Candlestick data
  symbol?: string;     // Optional symbol, if you want to display or use it
  mainRatio?: number;  // (Optional) fraction of vertical space for main chart. Default 70.
  rsiRatio?: number;   // (Optional) fraction of vertical space for RSI. Default 30.
}

export default function AdvancedChart({
  data,
  symbol,
  mainRatio = 70,
  rsiRatio = 30,
}: AdvancedChartProps) {
  // Refs to the DOM elements
  const containerRef = useRef<HTMLDivElement>(null);

  // We create two sub-containers:
  const mainChartContainer = useRef<HTMLDivElement>(null);
  const rsiChartContainer = useRef<HTMLDivElement>(null);

  // References to chart objects
  const mainChartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const rsiChartRef = useRef<IChartApi | null>(null);
  const rsiLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // --------------------
  // Chart Creation
  // --------------------
  useEffect(() => {
    if (!mainChartContainer.current || !rsiChartContainer.current) return;

    // 1) Create MAIN chart if not already
    if (!mainChartRef.current) {
      mainChartRef.current = createChart(mainChartContainer.current, {
        layout: {
          background: { color: "#0b0e11" },
          textColor: "#e0e0e0",
        },
        timeScale: {
          borderColor: "#2f3336",
          barSpacing: 8,
        },
        rightPriceScale: {
          borderColor: "#2f3336",
        },
        grid: {
          vertLines: { color: "#2f3336", style: 1 },
          horzLines: { color: "#2f3336", style: 1 },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            visible: true,
            style: 2,
            color: "#9194a3",
            labelVisible: true,
          },
          horzLine: {
            visible: true,
            style: 2,
            color: "#9194a3",
            labelVisible: false,
          },
        },
      });

      // Add candlestick
      mainSeriesRef.current = mainChartRef.current.addCandlestickSeries({
        upColor: "#2DBD85",
        downColor: "#F6465D",
        borderUpColor: "#26a69a",
        borderDownColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      // Add volume histogram
      volumeSeriesRef.current = mainChartRef.current.addHistogramSeries({
        priceScaleId: "",
        priceFormat: { type: "volume" },
      });
      volumeSeriesRef.current.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
    }

    // 2) Create RSI chart if not already
    if (!rsiChartRef.current) {
      rsiChartRef.current = createChart(rsiChartContainer.current, {
        layout: {
          background: { color: "#0b0e11" },
          textColor: "#e0e0e0",
        },
        timeScale: {
          borderColor: "#2f3336",
        },
        rightPriceScale: {
          borderColor: "#2f3336",
        },
        grid: {
          vertLines: { color: "#2f3336", style: 1 },
          horzLines: { color: "#2f3336", style: 1 },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { visible: true, style: 2, color: "#9194a3", labelVisible: false },
          horzLine: { visible: true, style: 2, color: "#9194a3", labelVisible: false },
        },
      });

      // RSI line
      rsiLineSeriesRef.current = rsiChartRef.current.addLineSeries({
        color: "#ff9900",
        lineWidth: 2,
      });
    }

    // 3) Sync time scales
    syncTimeScale(mainChartRef.current, rsiChartRef.current);

    // 4) Initial resize to fit parent's size
    handleResize();

    // 5) Listen for window resizes
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // --------------------
  // Chart Data Updates
  // --------------------
  useEffect(() => {
    if (!data.length) return;
    if (!mainSeriesRef.current || !volumeSeriesRef.current || !rsiLineSeriesRef.current) return;

    // 1) Candlesticks
    const candleData = data.map((d) => ({
      time: d.time as unknown as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    mainSeriesRef.current.setData(candleData);

    // 2) Volume
    const volumeData = data.map((d) => ({
      time: d.time as unknown as UTCTimestamp,
      value: d.volume,
      color: d.close > d.open ? "#2DBD85" : "#F6465D",
    }));
    volumeSeriesRef.current.setData(volumeData);

    // 3) RSI
    const rsiPoints = calculateRSI(data, 14);
    rsiLineSeriesRef.current.setData(rsiPoints);

    // Overbought / Oversold lines
    addHorizontalLine(rsiChartRef.current, 70, "#ff0000", data);
    addHorizontalLine(rsiChartRef.current, 30, "#00ff00", data);

  }, [data]);

  // --------------------
  // Resize Handler
  // --------------------
  function handleResize() {
    if (!containerRef.current) return;
    if (!mainChartContainer.current || !rsiChartContainer.current) return;
    if (!mainChartRef.current || !rsiChartRef.current) return;

    // The entire container's height
    const totalHeight = containerRef.current.clientHeight;
    const totalWidth = containerRef.current.clientWidth;

    // We'll split the container vertically by mainRatio vs. rsiRatio
    const ratioSum = mainRatio + rsiRatio;
    const mainHeight = Math.floor((mainRatio / ratioSum) * totalHeight);
    const rsiHeight = totalHeight - mainHeight; // remainder

    // Apply new sizes
    mainChartRef.current.applyOptions({
      width: totalWidth,
      height: mainHeight,
    });
    rsiChartRef.current.applyOptions({
      width: totalWidth,
      height: rsiHeight,
    });
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* If you want to display the symbol somewhere */}
      {/* {symbol && (
        <div style={{ padding: "0.2rem 0", background: "#222" }}>
          Symbol: {symbol}
        </div>
      )} */}

      {/* The main chart and RSI sub-containers fill the rest */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* We just place two placeholders; we size them in handleResize */}
        <div ref={mainChartContainer} style={{ flexShrink: 0 }} />
        <div ref={rsiChartContainer} style={{ flexShrink: 0, marginTop: 8 }} />
      </div>
    </div>
  );
}

/* =======================================
   HELPER FUNCTIONS
======================================= */

function calculateRSI(candles: Candle[], period: number) {
  // Returns an array of { time, value } for RSI
  if (candles.length < period) {
    return candles.map((c) => ({ time: c.time as unknown as UTCTimestamp, value: NaN }));
  }

  let rsi: Array<{ time: UTCTimestamp; value: number }> = [];

  let gains = 0;
  let losses = 0;

  // Initialize average gains/losses
  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let firstRSI = 100 - 100 / (1 + rs);

  rsi.push({
    time: candles[period].time as unknown as UTCTimestamp,
    value: firstRSI,
  });

  // Subsequent RSI values
  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) {
      avgGain = ((avgGain * (period - 1)) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgLoss = ((avgLoss * (period - 1)) - change) / period;
      avgGain = (avgGain * (period - 1)) / period;
    }
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const curRSI = 100 - 100 / (1 + rs);

    rsi.push({
      time: candles[i].time as unknown as UTCTimestamp,
      value: curRSI,
    });
  }

  // Fill with NaN for the first `period` bars
  const result: Array<{ time: UTCTimestamp; value: number }> = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      result.push({ time: candles[i].time as unknown as UTCTimestamp, value: NaN });
    } else {
      const idx = i - period;
      result.push({ time: rsi[idx].time, value: rsi[idx].value });
    }
  }
  return result;
}

function addHorizontalLine(
  chart: IChartApi | null,
  value: number,
  color: string,
  data: Candle[]
) {
  if (!chart || !data.length) return;
  const lineSeries = chart.addLineSeries({
    color,
    lineWidth: 1,
    lineStyle: LineStyle.Dotted,
  });
  lineSeries.setData([
    { time: data[0].time as unknown as UTCTimestamp, value },
    { time: data[data.length - 1].time as unknown as UTCTimestamp, value },
  ]);
}

// Synchronize time scale between two charts
function syncTimeScale(chartA: IChartApi | null, chartB: IChartApi | null) {
  if (!chartA || !chartB) return;

  const tsA = chartA.timeScale();
  const tsB = chartB.timeScale();

  let isSyncingA = false;
  let isSyncingB = false;

  tsA.subscribeVisibleLogicalRangeChange((range) => {
    if (isSyncingB) return;
    if (!range) return;
    isSyncingA = true;
    tsB.setVisibleLogicalRange(range);
    isSyncingA = false;
  });

  tsB.subscribeVisibleLogicalRangeChange((range) => {
    if (isSyncingA) return;
    if (!range) return;
    isSyncingB = true;
    tsA.setVisibleLogicalRange(range);
    isSyncingB = false;
  });
}
