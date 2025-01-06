// app/api/chart/route.ts

import { NextResponse } from 'next/server';

// Simple data structure describing a single candlestick
interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function GET() {
  // Mock candlestick data
  const data: Candle[] = [
    { time: '2023-01-01', open: 100, high: 105, low: 95, close: 102, volume: 5000 },
    { time: '2023-01-02', open: 102, high: 110, low: 101, close: 108, volume: 7000 },
    { time: '2023-01-03', open: 108, high: 112, low: 105, close: 107, volume: 6000 },
  ];

  return NextResponse.json(data);
}
