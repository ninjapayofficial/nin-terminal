// // app/[symbol]/page.tsx
// 'use client'

// import React, { useEffect, useState } from 'react'
// import { useParams } from 'next/navigation'
// import GridLayout from 'react-grid-layout'

// import TerminalTabs from '../components/TerminalTabs'
// import PluginTabs from '../components/PluginTabs'
// import OrderBook from '../components/OrderBook'
// import Watchlist from '../components/Watchlist'
// import BuySell from '../components/BuySell'
// import AdvancedChart from '../components/AdvancedChart'
// import Image from 'next/image'

// import styles from './symbolPage.module.css'

// /** ========== 1) Types for RGL ========== */
// interface RGLLayoutItem {
//   i: string
//   x: number
//   y: number
//   w: number
//   h: number
//   static?: boolean
//   minW?: number
//   maxW?: number
//   minH?: number
//   maxH?: number
//   moved?: boolean
//   isDraggable?: boolean
//   isResizable?: boolean
// }

// type RGLLayout = RGLLayoutItem[]

// /** ========== 2) Default Layout ========== */
// const defaultLayout: RGLLayout = [
//   { i: 'chartArea',      x: 0,  y: 0,  w: 8,  h: 16 },
//   { i: 'tabsAreaTop',    x: 0,  y: 10, w: 8,  h: 4 },
//   { i: 'orderBook',      x: 8,  y: 0,  w: 2,  h: 12 },
//   { i: 'watchlist',      x: 10, y: 0,  w: 2,  h: 12 },
//   { i: 'buySell',        x: 8,  y: 6,  w: 4,  h: 8 },
//   { i: 'tabsAreaBottom', x: 0,  y: 14, w: 12, h: 4 },
// ]

// export default function SymbolPage() {
//   /** ========== Symbol Param ========== */
//   const routeParams = useParams() as { symbol?: string }
//   const symbol = routeParams.symbol ?? 'paytm.ns'

//   /** ========== Chat Drawer ========== */
//   const [drawerOpen, setDrawerOpen] = useState(false)
//   const handleChatClick = () => setDrawerOpen(!drawerOpen)
//   const handleOverlayClick = () => setDrawerOpen(false)

//   /** ========== Widget Drawer ========== */
//   const [widgetDrawerOpen, setWidgetDrawerOpen] = useState(false)

//   /**
//    * Instead of storing "draggingWidget" in the layout rendering, 
//    * we store a "widgetMap" that associates each item key (i) with a widget type.
//    * For example: widgetMap["new-item-1673"] = "orderBook"
//    */
//   const [widgetMap, setWidgetMap] = useState<Record<string, string>>({})

//   /** ========== Layout State ========== */
//   const [layout, setLayout] = useState<RGLLayout>(defaultLayout)

//   /** ========== Chart Data Fetch ========== */
//   const [chartData, setChartData] = useState<any[]>([])
//   useEffect(() => {
//     fetch(`/api/chart?symbol=${symbol}`)
//       .then(res => res.json())
//       .then(data => setChartData(data))
//       .catch(err => console.error('Error fetching chart data:', err))
//   }, [symbol])

//   /** ========== Window Resize ========== */
//   const [gridWidth, setGridWidth] = useState<number>(1200)
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setGridWidth(window.innerWidth)
//       const handleResize = () => setGridWidth(window.innerWidth)
//       window.addEventListener('resize', handleResize)
//       return () => window.removeEventListener('resize', handleResize)
//     }
//   }, [])

//   /** ========== Listen for "open-widget-drawer" from Header ========== */
//   useEffect(() => {
//     const handleOpenDrawer = () => setWidgetDrawerOpen(true)
//     window.addEventListener('open-widget-drawer', handleOpenDrawer)
//     return () => {
//       window.removeEventListener('open-widget-drawer', handleOpenDrawer)
//     }
//   }, [])

//   /** ========== Toggle Widget Drawer ========== */
//   const toggleWidgetDrawer = () => setWidgetDrawerOpen(!widgetDrawerOpen)

//   /** ========== RGL: onDrop callback ========== */
//   const onDrop = (
//     currentLayout: RGLLayout,
//     droppedItem: RGLLayoutItem,
//     e: MouseEvent
//   ) => {
//     const newKey = `new-item-${Date.now()}`

//     // RGL automatically appended droppedItem to currentLayout
//     // We'll rename its key
//     const updatedLayout = currentLayout.map((item) =>
//       item === droppedItem ? { ...item, i: newKey } : item
//     )
//     setLayout(updatedLayout)

//     // Whichever widget was being dragged, store it in widgetMap
//     // so this new item always has the correct type
//     if (dragType) {
//       setWidgetMap((prev) => ({
//         ...prev,
//         [newKey]: dragType
//       }))
//     }
//     // Clear the global "dragType"
//     setDragType(null)
//   }

//   /** 
//    * We'll store which widget type the user is dragging 
//    * in a top-level state "dragType". 
//    * This is only used for the moment of drop. 
//    */
//   const [dragType, setDragType] = useState<string | null>(null)
//   const handleDragStart = (widget: string) => {
//     setDragType(widget)
//   }

//   return (
//     <div>
//       {/* ========== MAIN GRID ========== */}
//       <GridLayout
//         className="layout"
//         layout={layout}
//         onDrop={onDrop}
//         isDroppable={true}
//         droppingItem={{i:"widget", w: 3, h: 6 }}
//         cols={12}
//         rowHeight={30}
//         width={gridWidth}
//         margin={[7, 7]}
//         containerPadding={[7, 7]}
//         // resizeHandles={['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']}
//         // allow reordering/dropping between widgets
//         isDraggable={true}
//         isResizable={true}
//         // limit dragging to .widgetHandle
//         draggableHandle=".widgetHandle"
//         // show placeholder so you can see where it's dropping
//         useCSSTransforms={true}
//       >
//         {layout.map((item) => {
//           // If there's an entry in widgetMap, it's a new/dynamic item
//           const dynamicWidget = widgetMap[item.i]

//           return (
//             <div key={item.i} className={styles.dynamicItemContainer}>
//               {/* 
//                 4) Drag Handle in top-left corner:
//                 User can click+drag the "☰" icon to reorder the widget
//               */}
//               <div className={styles.widgetHandle}>☰</div>

//               {/* If dynamicWidget is defined => it's a new item */}
//               {dynamicWidget ? (
//                 <>
//                   {dynamicWidget === 'chart' && (
//                     <AdvancedChart data={chartData} symbol={symbol} />
//                   )}
//                   {dynamicWidget === 'orderBook' && <OrderBook />}
//                   {dynamicWidget === 'watchlist' && <Watchlist />}
//                   {dynamicWidget === 'buySell' && <BuySell symbol={symbol} />}
//                   {dynamicWidget === 'tabs' && <TerminalTabs />}
//                 </>
//               ) : (
//                 /** Otherwise, it's one of your default items by key */
//                 <>
//                   {item.i === 'chartArea' && (
//                     <AdvancedChart data={chartData} symbol="PAYTM.NS" />
//                   )}
//                   {item.i === 'tabsAreaTop' && <PluginTabs />}
//                   {item.i === 'orderBook' && <OrderBook />}
//                   {item.i === 'watchlist' && <Watchlist />}
//                   {item.i === 'buySell' && <BuySell symbol={symbol} />}
//                   {item.i === 'tabsAreaBottom' && <TerminalTabs />}
//                 </>
//               )}
//             </div>
//           )
//         })}
//       </GridLayout>

//       {/* ========== Additional TABS Below ========== */}
//       <div className={styles.pluginTabs}>
//         <TerminalTabs />
//       </div>

//       {/* ========== FLOATING CHAT BUTTON ========== */}
//       <button className={styles.chatButton} onClick={handleChatClick}>
//         <Image
//           src="/chat-ai.svg"
//           alt="NINtrade Stockbot Icon"
//           width={28}
//           height={28}
//           priority={true}
//         />
//       </button>
//       {drawerOpen && (
//         <div className={styles.overlay} onClick={handleOverlayClick}></div>
//       )}
//       <div
//         className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
//       >
//         <iframe
//           src="https://stockbot.nin.in/"
//           className={styles.iframeContainer}
//           title="StockBot Chat"
//         ></iframe>
//       </div>

//       {/* ========== "Add Widget" Button ========== */}
//       <button className={styles.addWidgetButton} onClick={toggleWidgetDrawer}>
//         Add Widget
//       </button>

//       {widgetDrawerOpen && (
//         <div className={styles.widgetDrawer}>
//           {/* 3) Drawer Header with Close Button */}
//           <div className={styles.widgetDrawerHeader}>
//             <h3>Widgets</h3>
//             <button className={styles.closeButton} onClick={toggleWidgetDrawer}>
//               ✕
//             </button>
//           </div>
//           <p>Drag an item below onto the grid:</p>

//           <div
//             className={styles.widgetDraggable}
//             draggable
//             onDragStart={() => handleDragStart('chart')}
//           >
//             <Image
//               src="/placeholder-chart.png"
//               alt="Chart Widget"
//               width={100}
//               height={60}
//             />
//             <span>Chart</span>
//           </div>

//           <div
//             className={styles.widgetDraggable}
//             draggable
//             onDragStart={() => handleDragStart('orderBook')}
//           >
//             <Image
//               src="/placeholder-orderbook.png"
//               alt="OrderBook Widget"
//               width={100}
//               height={60}
//             />
//             <span>OrderBook</span>
//           </div>

//           <div
//             className={styles.widgetDraggable}
//             draggable
//             onDragStart={() => handleDragStart('watchlist')}
//           >
//             <Image
//               src="/placeholder-watchlist.png"
//               alt="Watchlist Widget"
//               width={100}
//               height={60}
//             />
//             <span>Watchlist</span>
//           </div>

//           <div
//             className={styles.widgetDraggable}
//             draggable
//             onDragStart={() => handleDragStart('buySell')}
//           >
//             <Image
//               src="/placeholder-buysell.png"
//               alt="BuySell Widget"
//               width={100}
//               height={60}
//             />
//             <span>Buy/Sell</span>
//           </div>

//           <div
//             className={styles.widgetDraggable}
//             draggable
//             onDragStart={() => handleDragStart('tabs')}
//           >
//             <Image
//               src="/placeholder-tabs.png"
//               alt="Tabs Widget"
//               width={100}
//               height={60}
//             />
//             <span>Plugin Tabs</span>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
