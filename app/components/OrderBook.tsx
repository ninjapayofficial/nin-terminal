// app/components/OrderBook.tsx
"use client";

import React from 'react';

interface OrderItem {
  price: number;
  size: number;
}

interface OrderBookData {
  bids: OrderItem[];
  asks: OrderItem[];
}

interface OrderBookProps {
  data: OrderBookData;
}

export default function OrderBook({ data }: OrderBookProps) {
  const { bids, asks } = data;

  return (
    <div style={{ border: '1px solid #444', padding: 8 }}>
      <h2>Order Book</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        <div>
          <h3>Bids</h3>
          {bids.map((item, idx) => (
            <div key={idx}>
              Price: {item.price}, Size: {item.size}
            </div>
          ))}
        </div>
        <div>
          <h3>Asks</h3>
          {asks.map((item, idx) => (
            <div key={idx}>
              Price: {item.price}, Size: {item.size}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
