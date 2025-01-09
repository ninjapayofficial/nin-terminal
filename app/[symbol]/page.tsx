// app/[symbol]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import TerminalTabs from '../components/TerminalTabs'
import OrderBook from '../components/OrderBook'
import Watchlist from '../components/Watchlist'
import BuySell from '../components/BuySell'
import styles from './symbolPage.module.css'
import AdvancedChart from '../components/AdvancedChart'
import GridLayout from 'react-grid-layout'


export default function SymbolPage() {
  const routeParams = useParams() as { symbol?: string }
  const symbol = routeParams.symbol ?? 'paytm.ns'

  const [chartData, setChartData] = useState<any[]>([])
  // State to open/close the chat drawer
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetch(`/api/chart?symbol=${symbol}`)
      .then(res => res.json())
      .then(data => setChartData(data))
      .catch(err => console.error('Error fetching chart data:', err))
  }, [symbol])

  // Toggle the chat drawer
  const handleChatClick = () => {
    setDrawerOpen(!drawerOpen)
  }

  // Called when user clicks outside the drawer (overlay)
  const handleOverlayClick = () => {
    setDrawerOpen(false)
  }

  const layout = [
    // Left side (Chart)
    { i: 'chartArea',   x: 0, y: 0,  w: 8, h: 16 },
  
    // Left side (Tabs below chart)
    { i: 'tabsAreaTop', x: 0, y: 10, w: 8, h: 4 },
  
    // Right side (OrderBook - top)
    { i: 'orderBook',   x: 8, y: 0,  w: 2, h: 12 },
  
    // Right side (Watchlist - middle)
    { i: 'watchlist',   x: 10, y: 0,  w: 2, h: 12 },
  
    // Right side (Buy/Sell - bottom)
    { i: 'buySell',     x: 8, y: 6, w: 4, h: 8 },
  
    // Entire bottom area (Tabs)
    { i: 'tabsAreaBottom', x: 0, y: 14, w: 12, h: 4 },
  ]

  const [gridWidth, setGridWidth] = useState<number>(1200);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGridWidth(window.innerWidth);
      // optionally listen for resize:
      window.addEventListener('resize', () => {
        setGridWidth(window.innerWidth);
      });
    }
  }, []);
  

  return (
    <div>
      <GridLayout
        className="layout"
        layout={layout}       // the array we defined above
        cols={12}             // 12 columns
        rowHeight={30}        // each grid row is 30px tall
        width={gridWidth}     // total width in px - adjust for your design
        draggableHandle=".myDragHandle" /* Optional: if you want a handle */
      >
        {/* CHART area */}
        <div key="chartArea" className={styles.chartArea}>
          <AdvancedChart data={chartData} symbol="PAYTM.NS" />
        </div>

        {/* TABS area (top) */}
        <div key="tabsAreaTop" className={styles.tabsArea}>
          <TerminalTabs />
        </div>

        {/* ORDER BOOK */}
        <div key="orderBook" className={styles.orderBook}>
          <OrderBook />
        </div>

        {/* WATCHLIST */}
        <div key="watchlist" className={styles.watchlist}>
          <Watchlist />
        </div>

        {/* BUY/SELL */}
        <div key="buySell" className={styles.buySellArea}>
          <BuySell symbol={symbol} />
        </div>

        {/* optional TABS at bottom */}
        {/* <div key="tabsAreaBottom" className={styles.tabsArea}>
          <TerminalTabs />
        </div> */}
      </GridLayout>


      {/* Additional TABS below, if needed */}
      <div className={styles.tabsArea}>
        <TerminalTabs />
      </div>

      {/* ===== FLOATING CHAT BUTTON ===== */}
      <button className={styles.chatButton} onClick={handleChatClick}>
        <svg
          width="128"
          height="128"
          viewBox="0 0 128 128 "
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 64C16 37.4903 37.4903 16 64 16C90.5097 16 112 37.4903 112 64V98.2857C112 99.8778 112 100.674 111.925 101.344C111.298 106.907 106.907 111.298 101.344 111.925C100.674 112 99.8778 112 98.2857 112H64C37.4903 112 16 90.5097 16 64Z"
            stroke="white"
            strokeWidth="7"
          />
          <path
            d="M46 79C46 81.2091 47.7909 83 50 83C52.2091 83 54 81.2091 54 79C54 76.7909 52.2091 75 50 75C47.7909 75 46 76.7909 46 79Z"
            fill="white"
          />
          <path
            d="M66.2069 50.6285C66.9408 49.1433 69.059 49.1433 69.7929 50.6285L70.7855 52.6372C72.47 56.0461 74.91 59.0258 77.9196 61.3496L79.9497 62.9171C80.9866 63.7177 80.9866 65.2825 79.9497 66.0831L77.9196 67.6506C74.91 69.9744 72.47 72.9541 70.7855 76.363L69.7929 78.3717C69.059 79.8569 66.9408 79.8569 66.2069 78.3717L65.2143 76.363C63.5298 72.9541 61.0898 69.9744 58.0802 67.6506L56.0501 66.0831C55.0132 65.2825 55.0132 63.7177 56.0501 62.9171L58.0802 61.3496C61.0898 59.0258 63.5298 56.0461 65.2143 52.6372L66.2069 50.6285Z"
            stroke="white"
            strokeWidth="7"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ===== OVERLAY for outside-click ===== */}
      {drawerOpen && (
        <div className={styles.overlay} onClick={handleOverlayClick}></div>
      )}

      {/* ===== SIDE DRAWER with IFRAME ===== */}
      <div
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
      >
        <iframe
          src="https://stockbot.nin.in/"
          className={styles.iframeContainer}
          title="StockBot Chat"
        ></iframe>
      </div>
    </div>
  )
}
