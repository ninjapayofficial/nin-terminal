"use client";

import React, { useRef, useEffect } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CrosshairMode,
  LineStyle,
  BarData,
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
  width?: number;      // optional width, default fill container
  height?: number;     // optional main chart height, e.g. 400
  rsiHeight?: number;  // optional RSI chart height, e.g. 100
}

export default function AdvancedChart({
  data,
  width = 0, // 0 means auto
  height = 400,
  rsiHeight = 100,
}: AdvancedChartProps) {
  // Refs to the DOM elements
  const mainChartContainer = useRef<HTMLDivElement>(null);
  const rsiChartContainer = useRef<HTMLDivElement>(null);

  // References to chart objects
  const mainChartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const rsiChartRef = useRef<IChartApi | null>(null);
  const rsiLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!mainChartContainer.current || !rsiChartContainer.current) return;

    // ========== Create Main Chart ==========
    if (!mainChartRef.current) {
      mainChartRef.current = createChart(mainChartContainer.current, {
        width: width || mainChartContainer.current.clientWidth,
        height: height,
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
          vertLine: { visible: true, style: 2, color: "#9194a3", labelVisible: true },
          horzLine: { visible: true, style: 2, color: "#9194a3", labelVisible: false },
        },
      });

      // Candlestick series
      mainSeriesRef.current = mainChartRef.current.addCandlestickSeries({
        upColor: "#2DBD85",
        downColor: "#F6465D",
        borderUpColor: "#26a69a",
        borderDownColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      // Volume series (histogram)
      // Add the histogram series without scaleMargins
      volumeSeriesRef.current = mainChartRef.current.addHistogramSeries({
          priceScaleId: '', // Overlay on the same scale
          priceFormat: { type: 'volume' },
      });
    
      // Apply scaleMargins to the series' price scale
      volumeSeriesRef.current.priceScale().applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
      });
  
    }

    // ========== Create RSI Chart ==========
    if (!rsiChartRef.current) {
      rsiChartRef.current = createChart(rsiChartContainer.current, {
        width: width || rsiChartContainer.current.clientWidth,
        height: rsiHeight,
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

      rsiLineSeriesRef.current = rsiChartRef.current.addLineSeries({
        color: "#ff9900",
        lineWidth: 2,
      });
    }

    // Sync time scales so we can pan/zoom both charts together
    syncTimeScale(mainChartRef.current, rsiChartRef.current);

    // Resize handling
    function handleResize() {
      if (mainChartRef.current && mainChartContainer.current) {
        mainChartRef.current.applyOptions({
          width: mainChartContainer.current.clientWidth,
        });
      }
      if (rsiChartRef.current && rsiChartContainer.current) {
        rsiChartRef.current.applyOptions({
          width: rsiChartContainer.current.clientWidth,
        });
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, [width, height, rsiHeight]);

  // Whenever `data` changes, set chart data
  useEffect(() => {
    if (!mainSeriesRef.current || !volumeSeriesRef.current || !rsiLineSeriesRef.current) return;
    if (!data || !data.length) return;

    // Convert data to the format used by Lightweight Charts
    const candleData = data.map((d) => ({
      time: d.time as unknown as UTCTimestamp, // or parse to number if needed
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    mainSeriesRef.current.setData(candleData);

    // Volume series
    const volData = data.map((d) => {
      const color = d.close > d.open ? "#2DBD85" : "#F6465D";
      return {
        time: d.time as unknown as UTCTimestamp,
        value: d.volume,
        color,
      };
    });
    volumeSeriesRef.current.setData(volData);

    // ========== RSI Calculation & Plot ==========
    const rsiData = calculateRSI(data, 14);
    rsiLineSeriesRef.current.setData(rsiData);

    // Overbought / Oversold lines
    addHorizontalLine(rsiChartRef.current, 70, "#ff0000", data);
    addHorizontalLine(rsiChartRef.current, 30, "#00ff00", data);
  }, [data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Main Chart Container */}
      <div ref={mainChartContainer} style={{ width: "100%", height: height }} />
      {/* RSI Chart Container */}
      <div ref={rsiChartContainer} style={{ width: "100%", height: rsiHeight, marginTop: 8 }} />
    </div>
  );
}

/* =======================================
      HELPER FUNCTIONS
======================================= */

// Basic RSI Calculation
function calculateRSI(candles: Candle[], period = 14) {
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
      avgLoss = ((avgLoss * (period - 1))) / period;
    } else {
      avgLoss = ((avgLoss * (period - 1)) - change) / period;
      avgGain = ((avgGain * (period - 1))) / period;
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
      const idx = i - period; // offset
      result.push({ time: rsi[idx].time, value: rsi[idx].value });
    }
  }

  return result;
}

// Add horizontal line to RSI chart for 30 or 70
function addHorizontalLine(chart: IChartApi | null, value: number, color: string, data: Candle[]) {
  if (!chart || !data.length) return;
  const lineSeries = chart.addLineSeries({
    color,
    lineWidth: 1,
    lineStyle: LineStyle.Dotted,
  });
  lineSeries.setData([
    {
      time: data[0].time as unknown as UTCTimestamp,
      value: value,
    },
    {
      time: data[data.length - 1].time as unknown as UTCTimestamp,
      value: value,
    },
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
