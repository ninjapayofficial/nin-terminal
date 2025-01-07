"use client";

import React, { useState } from "react";
import styles from "./TerminalTabs.module.css";

const TABS = ["Open Orders", "Order History", "Trade History", "Holdings"];

export default function TerminalTabs() {
  const [activeTab, setActiveTab] = useState<string>(TABS[0]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Open Orders":
        return <div>Open orders data goes here (mock for now)...</div>;
      case "Order History":
        return <div>Order history data goes here...</div>;
      case "Trade History":
        return <div>Trade history data goes here...</div>;
      case "Holdings":
        return <div>Funds or balances data goes here...</div>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.tabsContainer}>
      <ul className={styles.tabList}>
        {TABS.map((tab) => (
          <li
            key={tab}
            className={`${styles.tabItem} ${
              tab === activeTab ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  );
}
