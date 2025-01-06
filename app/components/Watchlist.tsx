"use client";
import React, { useState } from "react";
import styles from "./Watchlist.module.css";

/** Three tabs at the top: Favorites, All Stocks, My Watchlist */
const TABS = ["Favorites", "All Stocks", "Watchlist"];

// Mock data
const favoritesData = [
  { symbol: "BNB/USDT", price: 716.58 },
  { symbol: "BTC/USDT", price: 27200 },
];
const allStocksData = [
  { symbol: "PAYTM.NS", price: 560 },
  { symbol: "TCS.NS", price: 3455 },
  { symbol: "AAPL", price: 150.25 },
  // etc.
];
const watchlistData = [
  { symbol: "TSLA", price: 210 },
  { symbol: "MSFT", price: 320 },
];

export default function Watchlist() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  function renderTabContent() {
    switch (activeTab) {
      case "Favorites":
        return favoritesData.map((item) => (
          <div key={item.symbol}>
            {item.symbol} - {item.price}
          </div>
        ));
      case "All Stocks":
        return allStocksData.map((item) => (
          <div key={item.symbol}>
            {item.symbol} - {item.price}
          </div>
        ));
      case "Watchlist":
        return watchlistData.map((item) => (
          <div key={item.symbol}>
            {item.symbol} - {item.price}
          </div>
        ));
      default:
        return null;
    }
  }

  return (
    <div className={styles.watchlistContainer}>
      <div className={styles.tabHeader}>
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`${styles.tab} ${tab === activeTab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  );
}
