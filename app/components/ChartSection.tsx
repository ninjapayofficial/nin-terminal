// app/components/ChartSection.tsx
"use client";

import React from 'react';

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartSectionProps {
  data: Candle[];
}

export default function ChartSection({ data }: ChartSectionProps) {
  // data = array of candlesticks
  return (
    <div style={{ border: '1px solid #444', minHeight: 200, padding: 8 }}>
      <h2 style={{ marginBottom: 8 }}>Chart</h2>
      <p>Mock candlestick data length: {data.length}</p>
      {/* You could integrate a real chart library here */}
    </div>
  );
}
