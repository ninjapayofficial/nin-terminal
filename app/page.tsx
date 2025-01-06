// app/page.tsx
"use client"; // This ensures client-side rendering

import React, { useEffect, useState } from 'react';
import ChartSection from './components/ChartSection';
import OrderBook from './components/OrderBook';
import Watchlist from './components/Watchlist';
import Trades from './components/Trades';
import styles from './page.module.css';

// Candle data shape
interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface OrderItem {
  price: number;
  size: number;
}

interface OrderBookData {
  bids: OrderItem[];
  asks: OrderItem[];
}

interface WatchlistItem {
  symbol: string;
  lastPrice: number;
}

type SideType = 'BUY' | 'SELL';
interface Trade {
  time: string;
  side: SideType;
  price: number;
  size: number;
}

export default function HomePage() {
  const [chartData, setChartData] = useState<Candle[]>([]);
  const [orderbookData, setOrderbookData] = useState<OrderBookData>({ bids: [], asks: [] });
  const [watchlistData, setWatchlistData] = useState<WatchlistItem[]>([]);
  const [tradesData, setTradesData] = useState<Trade[]>([]);

  // Fetch chart data
  useEffect(() => {
    fetch('/api/chart')
      .then((res) => res.json())
      .then((data: Candle[]) => setChartData(data))
      .catch((err) => console.error('Chart fetch error:', err));
  }, []);

  // Fetch orderbook
  useEffect(() => {
    fetch('/api/orderbook')
      .then((res) => res.json())
      .then((data: OrderBookData) => setOrderbookData(data))
      .catch((err) => console.error('Orderbook fetch error:', err));
  }, []);

  // Fetch watchlist
  useEffect(() => {
    fetch('/api/watchlist')
      .then((res) => res.json())
      .then((data: WatchlistItem[]) => setWatchlistData(data))
      .catch((err) => console.error('Watchlist fetch error:', err));
  }, []);

  // Fetch trades
  useEffect(() => {
    fetch('/api/trades')
      .then((res) => res.json())
      .then((data: Trade[]) => setTradesData(data))
      .catch((err) => console.error('Trades fetch error:', err));
  }, []);

  return (
    <main className={styles.container}>
      {/* Left column: Order Book */}
      <div className={styles.orderBook}>
        <OrderBook data={orderbookData} />
      </div>

      {/* Center column: chart at top, buy/sell & open orders at bottom */}
      <div className={styles.centerColumn}>
        <div className={styles.chartSection}>
          <ChartSection data={chartData} />
        </div>
        <div className={styles.tradeSection}>
          <div className={styles.buySell}>
            <h3>Buy / Sell</h3>
            {/* Mock buy/sell forms here */}
          </div>
          <div className={styles.openOrders}>
            <h3>Open Orders</h3>
            {/* Show open orders if you had them */}
          </div>
        </div>
      </div>

      {/* Right column: watchlist, trades, etc. */}
      <div className={styles.rightColumn}>
        <Watchlist data={watchlistData} />
        <Trades data={tradesData} />
      </div>
    </main>
  );
}
