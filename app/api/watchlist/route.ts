// app/api/watchlist/route.ts

import { NextResponse } from 'next/server';

interface WatchlistItem {
  symbol: string;
  lastPrice: number;
}

export async function GET() {
  const watchlist: WatchlistItem[] = [
    { symbol: 'AAPL', lastPrice: 150.25 },
    { symbol: 'TSLA', lastPrice: 230.1 },
    { symbol: 'MSFT', lastPrice: 320.0 },
  ];

  return NextResponse.json(watchlist);
}
