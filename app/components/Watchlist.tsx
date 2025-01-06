// app/components/Watchlist.tsx
"use client";

import React from 'react';

interface WatchlistItem {
  symbol: string;
  lastPrice: number;
}

interface WatchlistProps {
  data: WatchlistItem[];
}

export default function Watchlist({ data }: WatchlistProps) {
  return (
    <div style={{ border: '1px solid #444', padding: 8, marginBottom: 8 }}>
      <h3>Watchlist</h3>
      <ul>
        {data.map((item, idx) => (
          <li key={idx}>
            {item.symbol} - ${item.lastPrice}
          </li>
        ))}
      </ul>
    </div>
  );
}
