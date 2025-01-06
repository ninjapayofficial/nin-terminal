// app/[symbol]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChartSection from "../components/ChartSection";
import TerminalTabs from "../components/TerminalTabs";
import OrderBook from "../components/OrderBook";
import Watchlist from "../components/Watchlist";
import BuySell from "../components/BuySell";
import styles from "./symbolPage.module.css";


// No SymbolPageProps needed, we won't get 'params' from function args
export default function SymbolPage() {
  const routeParams = useParams() as { symbol?: string };

  // If no symbol is present, fallback to 'paytm.ns' in a single line
  const symbol = routeParams.symbol ?? "paytm.ns";

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/chart?symbol=${symbol}`)
      .then((res) => res.json())
      .then((data) => setChartData(data))
      .catch((err) => console.error("Error fetching chart data:", err));
  }, [symbol]);

    return (
    <div>
      <h3>Symbol: {symbol}</h3>
      <p>Chart data length: {chartData.length}</p>
      <div className={styles.container}>
      {/* LEFT: Chart, then the bottom TABS (Open Orders, Trade History, etc.) */}
      <div className={styles.leftPane}>
        <div className={styles.chartArea}>
          <ChartSection symbol={symbol} data={chartData} />
        </div>
        <div className={styles.tabsArea}>
          <TerminalTabs />
        </div>
      </div>

      {/* RIGHT: Top (OrderBook + Watchlist tabs) and bottom (Buy/Sell) */}
      <div className={styles.rightPane}>
        <div className={styles.topRight}>
          <div className={styles.orderBook}>
            <OrderBook />
          </div>
          <div className={styles.watchlist}>
            <Watchlist />
          </div>
        </div>
        <div className={styles.buySellArea}>
          <BuySell symbol={symbol} />
        </div>
      </div>
    </div>
    </div>
  );
}
