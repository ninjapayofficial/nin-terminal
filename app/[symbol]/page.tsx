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
import AdvancedChart from "../components/AdvancedChart";

export default function SymbolPage() {
  const routeParams = useParams() as { symbol?: string };
  const symbol = routeParams.symbol ?? "paytm.ns";

  const [chartData, setChartData] = useState<any[]>([]);
  // State to open/close the chat drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/chart?symbol=${symbol}`)
      .then((res) => res.json())
      .then((data) => setChartData(data))
      .catch((err) => console.error("Error fetching chart data:", err));
  }, [symbol]);

  // Toggle the chat drawer
  const handleChatClick = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Called when user clicks outside the drawer (overlay)
  const handleOverlayClick = () => {
    setDrawerOpen(false);
  };

  return (
    <div>
      <div className={styles.container}>
        {/* LEFT: Chart + TABS */}
        <div className={styles.leftPane}>
          <div className={styles.chartArea}>
            <AdvancedChart data={chartData} symbol="PAYTM.NS" />
          </div>
          <div className={styles.tabsArea}>
            <TerminalTabs />
          </div>
        </div>

        {/* RIGHT: (OrderBook + Watchlist) + (BuySell) */}
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

      {/* Additional TABS below, if needed */}
      <div className={styles.tabsArea}>
        <TerminalTabs />
      </div>

      {/* ===== FLOATING CHAT BUTTON ===== */}
      <button className={styles.chatButton} onClick={handleChatClick}>
        Bot
      </button>

      {/* ===== OVERLAY for outside-click ===== */}
      {drawerOpen && (
        <div className={styles.overlay} onClick={handleOverlayClick}></div>
      )}

      {/* ===== SIDE DRAWER with IFRAME ===== */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}>
        <iframe
          src="https://stockbot.nin.in/"
          className={styles.iframeContainer}
          title="StockBot Chat"
        ></iframe>
      </div>
    </div>
  );
}
