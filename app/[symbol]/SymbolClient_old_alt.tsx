// // app/[symbol]/SymbolClient.tsx
// "use client";
// import React, { useEffect, useState } from "react";
// import ChartSection from "../components/ChartSection";
// import TerminalTabs from "../components/TerminalTabs";
// import OrderBook from "../components/OrderBook";
// import Watchlist from "../components/Watchlist";
// import BuySell from "../components/BuySell";
// import styles from "./symbolPage.module.css";

// interface SymbolClientProps {
//   symbol: string;
// }

// export default function SymbolClient({ symbol }: SymbolClientProps) {
//   const [chartData, setChartData] = useState<any[]>([]);

//   useEffect(() => {
//     fetch(`/api/chart?symbol=${symbol}`)
//       .then((res) => res.json())
//       .then((data) => setChartData(data))
//       .catch((err) => console.error("Chart fetch error:", err));
//   }, [symbol]);

//   return (
//     <div>
//       <h3>Symbol: {symbol}</h3>
//       <p>Chart data length: {chartData.length}</p>
//       <div className={styles.container}>
//       {/* LEFT: Chart, then the bottom TABS (Open Orders, Trade History, etc.) */}
//       <div className={styles.leftPane}>
//         <div className={styles.chartArea}>
//           <ChartSection symbol={symbol} data={chartData} />
//         </div>SymbolClient.tsx
//         <div className={styles.tabsArea}>
//           <TerminalTabs />
//         </div>
//       </div>

//       {/* RIGHT: Top (OrderBook + Watchlist tabs) and bottom (Buy/Sell) */}
//       <div className={styles.rightPane}>
//         <div className={styles.topRight}>
//           <div className={styles.orderBook}>
//             <OrderBook />
//           </div>
//           <div className={styles.watchlist}>
//             <Watchlist />
//           </div>
//         </div>
//         <div className={styles.buySellArea}>
//           <BuySell symbol={symbol} />
//         </div>
//       </div>
//     </div>
//       {/* ...rest of your layout components here... */}
//     </div>
//   );
// }


// ////////

// // /[symbol]/page.tsx
// // app/[symbol]/page.tsx
// import React from "react";
// import SymbolClient from "./SymbolClient";

// interface SymbolPageProps {
//   params: {
//     symbol?: string;
//   };
// }

// /** Server Component fetching 'symbol' from params directly */
// export default function SymbolPage({ params }: SymbolPageProps) {
//   // If no symbol was provided, fallback to 'paytm.ns'
//   const symbol = params.symbol ?? "paytm.ns";

//   // Return a client child if you need client-side logic
//   return <SymbolClient symbol={symbol} />;
// }