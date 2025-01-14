// // app/[symbol]/page.tsx
// 'use client'

// import React, { useEffect, useState } from 'react'
// import { useParams } from 'next/navigation'
// import TerminalTabs from '../components/TerminalTabs'
// import PluginTabs from '../components/PluginTabs'
// import OrderBook from '../components/OrderBook'
// import Watchlist from '../components/Watchlist'
// import BuySell from '../components/BuySell'
// import styles from './symbolPage.module.css'
// import AdvancedChart from '../components/AdvancedChart'
// import GridLayout from 'react-grid-layout'
// import Image from 'next/image'

// export default function SymbolPage() {
//   const routeParams = useParams() as { symbol?: string }
//   const symbol = routeParams.symbol ?? 'paytm.ns'

//   const [chartData, setChartData] = useState<any[]>([])
//   // State to open/close the chat drawer
//   const [drawerOpen, setDrawerOpen] = useState(false)

//   useEffect(() => {
//     fetch(`/api/chart?symbol=${symbol}`)
//       .then(res => res.json())
//       .then(data => setChartData(data))
//       .catch(err => console.error('Error fetching chart data:', err))
//   }, [symbol])

//   // Toggle the chat drawer
//   const handleChatClick = () => {
//     setDrawerOpen(!drawerOpen)
//   }

//   // Called when user clicks outside the drawer (overlay)
//   const handleOverlayClick = () => {
//     setDrawerOpen(false)
//   }

//   const layout = [
//     // Left side (Chart)
//     { i: 'chartArea',   x: 0, y: 0,  w: 8, h: 16 },

//     // Left side (Tabs below chart)
//     { i: 'tabsAreaTop', x: 0, y: 10, w: 8, h: 4 },

//     // Right side (OrderBook - top)
//     { i: 'orderBook',   x: 8, y: 0,  w: 2, h: 12 },

//     // Right side (Watchlist - middle)
//     { i: 'watchlist',   x: 10, y: 0,  w: 2, h: 12 },

//     // Right side (Buy/Sell - bottom)
//     { i: 'buySell',     x: 8, y: 6, w: 4, h: 8 },

//     // Entire bottom area (Tabs)
//     { i: 'tabsAreaBottom', x: 0, y: 14, w: 12, h: 4 },
//   ]

//   const [gridWidth, setGridWidth] = useState<number>(1200);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setGridWidth(window.innerWidth);
//       // optionally listen for resize:
//       window.addEventListener('resize', () => {
//         setGridWidth(window.innerWidth);
//       });
//     }
//   }, []);

//   return (
//     <div>
//       <GridLayout
//         className="layout"
//         layout={layout}       // the array we defined above
//         cols={12}             // 12 columns
//         rowHeight={30}        // each grid row is 30px tall
//         width={gridWidth}     // total width in px - adjust for your design
//         draggableHandle=".myDragHandle" /* Optional: if you want a handle */
//         // Add the following props to make GridLayout responsive to its container
//         isResizable={true}
//         isDraggable={false} // Set to true if you want draggable items
//         // Optionally, set margins and container padding as needed
//         margin={[7, 7]}
//         containerPadding={[7, 7]}
//       >
//         {/* CHART area */}
//         <div key="chartArea" className={styles.chartArea}>
//           <AdvancedChart data={chartData} symbol="PAYTM.NS" />
//         </div>

//         {/* TABS area (top) */}
//         <div key="tabsAreaTop" className={styles.tabsArea}>
//           <PluginTabs />
//         </div>

//         {/* ORDER BOOK */}
//         <div key="orderBook" className={styles.orderBook}>
//           <OrderBook />
//         </div>

//         {/* WATCHLIST */}
//         <div key="watchlist" className={styles.watchlist}>
//           <Watchlist />
//         </div>

//         {/* BUY/SELL */}
//         <div key="buySell" className={styles.buySellArea}>
//           <BuySell symbol={symbol} />
//         </div>

//         {/* optional TABS at bottom */}
//         {/* <div key="tabsAreaBottom" className={styles.tabsArea}>
//           <TerminalTabs />
//         </div> */}
//       </GridLayout>

//       {/* Additional TABS below, if needed */}
//       <div className={styles.pluginTabs}>
//         <TerminalTabs />
//       </div>

//       {/* ===== FLOATING CHAT BUTTON ===== */}
//       <button className={styles.chatButton} onClick={handleChatClick}>
//         <Image
//           src="/chat-ai.svg"
//           alt="NINtrade Stockbot Icon"
//           width={28}
//           height={28}
//           priority={true}
//         />
//       </button>

//       {/* ===== OVERLAY for outside-click ===== */}
//       {drawerOpen && (
//         <div className={styles.overlay} onClick={handleOverlayClick}></div>
//       )}

//       {/* ===== SIDE DRAWER with IFRAME ===== */}
//       <div
//         className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
//       >
//         <iframe
//           src="https://stockbot.nin.in/"
//           className={styles.iframeContainer}
//           title="StockBot Chat"
//         ></iframe>
//       </div>
//     </div>
//   )
// }
