// // app/components/AdvancedChart.tsx
// 'use client'

// import React, { useRef, useEffect, useState } from 'react'
// import {
//   createChart,
//   IChartApi,
//   ISeriesApi,
//   CrosshairMode,
//   LineStyle,
//   UTCTimestamp
// } from 'lightweight-charts'

// interface Candle {
//   time: string
//   open: number
//   high: number
//   low: number
//   close: number
//   volume: number
// }

// interface AdvancedChartProps {
//   data: Candle[]
//   symbol?: string
//   mainRatio?: number
//   rsiRatio?: number
//   // NEW: We accept an optional user script code
//   userScriptCode?: string | null;
// }

// export default function AdvancedChart({
//   data,
//   symbol,
//   mainRatio = 70,
//   rsiRatio = 30,
//   userScriptCode // NEW
// }: AdvancedChartProps) {
//   // Refs
//   const containerRef = useRef<HTMLDivElement>(null)
//   const mainChartContainer = useRef<HTMLDivElement>(null)
//   const rsiChartContainer = useRef<HTMLDivElement>(null)
//   const popupRef = useRef<HTMLDivElement>(null)

//   const mainChartRef = useRef<IChartApi | null>(null)
//   const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
//   const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

//   const rsiChartRef = useRef<IChartApi | null>(null)
//   const rsiLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

//   // NEW: A ref to the user’s custom indicator line series
//   const userIndicatorSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

//   // Popup states
//   const [actionsVisible, setActionsVisible] = useState(false)
//   const [popupVisible, setPopupVisible] = useState(false)
//   const [popupX, setPopupX] = useState(0)
//   const [popupY, setPopupY] = useState(0)
//   const [lastPrice, setLastPrice] = useState<number | null>(null)
//   const [price, setPrice] = useState<number | null>(null)
//   const [percentChange, setPercentChange] = useState<string>('')

//   // 1) Create charts on mount
//   useEffect(() => {
//     if (!mainChartContainer.current || !rsiChartContainer.current) return

//     // MAIN chart
//     if (!mainChartRef.current) {
//       mainChartRef.current = createChart(mainChartContainer.current, {
//         layout: {
//           background: { color: '#0b0e11' },
//           textColor: '#e0e0e0'
//         },
//         timeScale: { borderColor: '#2f3336', barSpacing: 8 },
//         rightPriceScale: { borderColor: '#2f3336' },
//         grid: {
//           vertLines: { color: '#2f3336', style: 1 },
//           horzLines: { color: '#2f3336', style: 1 }
//         },
//         crosshair: {
//           mode: CrosshairMode.Normal,
//           vertLine: {
//             visible: true,
//             style: 2,
//             color: '#9194a3',
//             labelVisible: true
//           },
//           horzLine: {
//             visible: true,
//             style: 2,
//             color: '#9194a3',
//             labelVisible: false
//           }
//         }
//       })

//       mainSeriesRef.current = mainChartRef.current.addCandlestickSeries({
//         upColor: '#2DBD85',
//         downColor: '#F6465D',
//         borderUpColor: '#26a69a',
//         borderDownColor: '#ef5350',
//         wickUpColor: '#26a69a',
//         wickDownColor: '#ef5350'
//       })
//       volumeSeriesRef.current = mainChartRef.current.addHistogramSeries({
//         priceScaleId: '',
//         priceFormat: { type: 'volume' }
//       })
//       volumeSeriesRef.current.priceScale().applyOptions({
//         scaleMargins: { top: 0.8, bottom: 0 }
//       })
//     }

//     // RSI chart
//     if (!rsiChartRef.current) {
//       rsiChartRef.current = createChart(rsiChartContainer.current, {
//         layout: { background: { color: '#0b0e11' }, textColor: '#e0e0e0' },
//         timeScale: { borderColor: '#2f3336' },
//         rightPriceScale: { borderColor: '#2f3336' },
//         grid: {
//           vertLines: { color: '#2f3336', style: 1 },
//           horzLines: { color: '#2f3336', style: 1 }
//         },
//         crosshair: {
//           mode: CrosshairMode.Normal,
//           vertLine: {
//             visible: true,
//             style: 2,
//             color: '#9194a3',
//             labelVisible: false
//           },
//           horzLine: {
//             visible: true,
//             style: 2,
//             color: '#9194a3',
//             labelVisible: false
//           }
//         }
//       })
//       rsiLineSeriesRef.current = rsiChartRef.current.addLineSeries({
//         color: '#ff9900',
//         lineWidth: 2
//       })
//     }

//     // Sync time scales
//     syncTimeScale(mainChartRef.current, rsiChartRef.current)

//     // If we have data, set lastPrice
//     if (data.length > 0) {
//       const lastCandle = data[data.length - 1]
//       setLastPrice(lastCandle.close)
//     }

//     // Initial resize
//     handleResize()
//     // Remove window resize listener since we'll use ResizeObserver instead
//     // window.addEventListener('resize', handleResize)

//     // CROSSHAIR: we do NOT hide on param.point=null
//     // we only hide the popup on container's mouseleave
//     if (mainChartRef.current && mainSeriesRef.current) {
//       mainChartRef.current.subscribeCrosshairMove(param => {
//         // If param.point is null => user is outside the main candle area or scale
//         // => in old code we might hide, but we won't do that here
//         if (!param.point) {
//           // do nothing (i.e. keep the popup in place)
//           return
//         }

//         // Ensure popup is visible if inside container
//         setPopupVisible(true)

//         // Y => price
//         const currentPrice = mainSeriesRef.current!.coordinateToPrice(
//           param.point.y
//         )
//         if (currentPrice == null) return // no update
//         setPrice(currentPrice)

//         // % from last
//         if (lastPrice != null && lastPrice !== 0) {
//           const pc = ((currentPrice - lastPrice) / lastPrice) * 100
//           const sign = pc >= 0 ? '+' : ''
//           setPercentChange(`(${sign}${pc.toFixed(2)}%)`)
//         } else {
//           setPercentChange('')
//         }

//         // Position near right side
//         const chartW = mainChartContainer.current!.clientWidth
//         const popupW = 200
//         const x = chartW - popupW - 10
//         const popupHeight = popupRef.current
//           ? popupRef.current.offsetHeight
//           : 60 // Fallback to default
//         const y = param.point.y - popupHeight / 2
//         setPopupX(x)
//         setPopupY(y)
//       })
//     }

//     // MOUSE EVENTS ON CONTAINER:
//     // - Hide on mouseleave
//     const containerEl = containerRef.current
//     if (containerEl) {
//       containerEl.addEventListener('mouseleave', onMouseLeave)
//       containerEl.addEventListener('mouseenter', onMouseEnter)
//     }

//     // 6. **Add ResizeObserver**
//     const resizeObserver = new ResizeObserver(() => {
//       handleResize()
//     })
//     if (containerEl) {
//       resizeObserver.observe(containerEl)
//     }

//     return () => {
//       // window.removeEventListener('resize', handleResize)
//       if (containerEl) {
//         containerEl.removeEventListener('mouseleave', onMouseLeave)
//         containerEl.removeEventListener('mouseenter', onMouseEnter)
//         resizeObserver.unobserve(containerEl)
//       }
//     }
//   }, [data, lastPrice])

//   // 2) Data updates => set chart data
//   useEffect(() => {
//     if (!data.length) return
//     if (
//       !mainSeriesRef.current ||
//       !volumeSeriesRef.current ||
//       !rsiLineSeriesRef.current
//     )
//       return

//     // Candles
//     const candleData = data.map(d => ({
//       time: d.time as unknown as UTCTimestamp,
//       open: d.open,
//       high: d.high,
//       low: d.low,
//       close: d.close
//     }))
//     mainSeriesRef.current.setData(candleData)

//     // Volume
//     const volData = data.map(d => ({
//       time: d.time as unknown as UTCTimestamp,
//       value: d.volume,
//       color: d.close > d.open ? '#2DBD85' : '#F6465D'
//     }))
//     volumeSeriesRef.current.setData(volData)

//     // RSI
//     const rsiPts = calculateRSI(data, 14)
//     rsiLineSeriesRef.current.setData(rsiPts)
//     addHorizontalLine(rsiChartRef.current, 70, '#ff0000', data)
//     addHorizontalLine(rsiChartRef.current, 30, '#00ff00', data)
//   }, [data])

//   // NEW: 3) Listen for changes to userScriptCode => parse & plot user indicator
//   useEffect(() => {
//     if (!mainChartRef.current) return

//     // If user cleared the script, remove the old line
//     if (!userScriptCode) {
//       if (userIndicatorSeriesRef.current) {
//         mainChartRef.current.removeSeries(userIndicatorSeriesRef.current)
//         userIndicatorSeriesRef.current = null
//       }
//       return
//     }

//     // Remove old user indicator line if it exists
//     if (userIndicatorSeriesRef.current) {
//       mainChartRef.current.removeSeries(userIndicatorSeriesRef.current)
//       userIndicatorSeriesRef.current = null
//     }

//     try {
//       // 1) Evaluate user code => get "main" function
//       //    We'll do a quick approach using new Function (in real code, do better sandboxing).
//       const wrappedScript = `
//         ${userScriptCode}
//         return (typeof main === 'function') ? main : null;
//       `
//       const userFunc = new Function(wrappedScript)()

//       if (typeof userFunc !== 'function') {
//         console.error('No function main(data) found in user script.')
//         return
//       }

//       // 2) Convert your data => UTCTimestamp
//       const candleData = data.map(d => ({
//         ...d,
//         time: d.time as unknown as UTCTimestamp
//       }))

//       // 3) Call user function => get array of { time, value }
//       const resultData = userFunc(candleData)
//       if (!Array.isArray(resultData) || resultData.length === 0) {
//         console.error('User script returned no data.')
//         return
//       }

//       // 4) Plot it on a new line series
//       userIndicatorSeriesRef.current = mainChartRef.current.addLineSeries({
//         color: 'yellow',
//         lineWidth: 2
//       })
//       userIndicatorSeriesRef.current.setData(resultData)
//     } catch (err) {
//       console.error('Error running user script:', err)
//     }
//   }, [userScriptCode, data])

//   // 3) Resize
//   function handleResize() {
//     if (!containerRef.current || !mainChartRef.current || !rsiChartRef.current)
//       return
//     const totalH = containerRef.current.clientHeight
//     const totalW = containerRef.current.clientWidth
//     const sum = mainRatio + rsiRatio
//     const mh = Math.floor((mainRatio / sum) * totalH)
//     const rh = totalH - mh
//     mainChartRef.current.applyOptions({ width: totalW, height: mh })
//     rsiChartRef.current.applyOptions({ width: totalW, height: rh })
//     mainChartRef.current.timeScale().fitContent()
//     rsiChartRef.current.timeScale().fitContent()
//   }

//   // 4) Container-level mouse events
//   function onMouseLeave() {
//     setPopupVisible(false) // Only hide if truly leaving container
//   }
//   function onMouseEnter() {
//     // If we want to show the popup again as soon as they re-enter, we can do so
//     // but typically we'll let crosshair move event handle it
//     // setPopupVisible(true);
//   }

//   // 5) The “+ button => buy/sell/draw” toggles
//   function toggleActions() {
//     setActionsVisible(!actionsVisible)
//   }

//   function handleBuy() {
//     if (price == null) return
//     alert(`Buy at $${price.toFixed(2)}`)
//   }

//   function handleSell() {
//     if (price == null) return
//     alert(`Sell at $${price.toFixed(2)}`)
//   }

//   function handleDraw() {
//     if (!data.length || price == null || !mainChartRef.current) return
//     const lineSeries = mainChartRef.current.addLineSeries({
//       color: '#ffffff',
//       lineWidth: 1
//     })
//     const firstTime = data[0].time as unknown as UTCTimestamp
//     const lastTime = data[data.length - 1].time as unknown as UTCTimestamp
//     lineSeries.setData([
//       { time: firstTime, value: price },
//       { time: lastTime, value: price }
//     ])
//     alert(`Horizontal line drawn at $${price.toFixed(2)}`)
//   }

//   // Popup style
//   const popupStyle: React.CSSProperties = {
//     position: 'absolute',
//     left: popupX + 100,
//     top: popupY,
//     // width: 150,
//     background: '#c6dfeaf6',
//     border: '1px solid #00000017',
//     borderRadius: 5,
//     boxShadow: '0 2px 8px rgba(166, 206, 219, 0.5)',
//     display: popupVisible ? 'flex' : 'none',
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: '5px',
//     zIndex: 9999,
//     pointerEvents: popupVisible ? 'auto' : 'none'
//   }

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         position: 'relative',
//         width: '100%',
//         height: '100%',
//         display: 'flex',
//         flexDirection: 'column'
//       }}
//     >
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         <div ref={mainChartContainer} style={{ flex: 1 }} /> {/* Make it flexible */}
//         <div ref={rsiChartContainer} style={{ flexShrink: 0, marginTop: 8 }} />
//       </div>

//       {/* Popup (like Node plugin) */}
//       <div ref={popupRef} style={popupStyle}>
//         <button
//           onClick={toggleActions}
//           style={{
//             background: '#88a1ac',
//             color: '#fff',
//             width: 18,
//             height: 18,
//             borderRadius: '50%',
//             textAlign: 'center',
//             padding: 0,
//             fontSize: 12,
//             lineHeight: '18px',
//             cursor: 'pointer',
//             border: 'none',
//             marginRight: 5
//           }}
//         >
//           +
//         </button>

//         {actionsVisible && (
//           <div
//             style={{ display: 'flex', flexDirection: 'column', marginRight: 6 }}
//           >
//             <button
//               style={{ marginBottom: 5, background: '#16a085', color: '#fff' }}
//               onClick={handleBuy}
//             >
//               Buy
//             </button>
//             <button
//               style={{ marginBottom: 5, background: '#c0392b', color: '#fff' }}
//               onClick={handleSell}
//             >
//               Sell
//             </button>
//             <button
//               style={{ background: '#2980b9', color: '#fff' }}
//               onClick={handleDraw}
//             >
//               Draw
//             </button>
//           </div>
//         )}

//         <p style={{ margin: 0, fontSize: 10, color: '#000' }}>
//           {price ? `${price.toFixed(2)}` : ''}
//           {percentChange ? (
//             <>
//               {' '}
//               <span
//                 style={{
//                   color: percentChange.startsWith('(+') ? '#16a085' : '#c0392b'
//                 }}
//               >
//                 {percentChange}
//               </span>
//             </>
//           ) : null}
//         </p>
//       </div>
//     </div>
//   )
// }

// /* ===============================
//    HELPER FUNCTIONS (unchanged)
// =============================== */
// function calculateRSI(candles: Candle[], period: number) {
//   if (candles.length < period) {
//     return candles.map(c => ({
//       time: c.time as unknown as UTCTimestamp,
//       value: NaN
//     }))
//   }
//   const rsi: Array<{ time: UTCTimestamp; value: number }> = []
//   let gains = 0
//   let losses = 0

//   for (let i = 1; i <= period; i++) {
//     const change = candles[i].close - candles[i - 1].close
//     if (change > 0) gains += change
//     else losses -= change
//   }
//   let avgGain = gains / period
//   let avgLoss = losses / period
//   let rs = avgLoss === 0 ? 100 : avgGain / avgLoss
//   const firstRSI = 100 - 100 / (1 + rs)

//   rsi.push({
//     time: candles[period].time as unknown as UTCTimestamp,
//     value: firstRSI
//   })

//   for (let i = period + 1; i < candles.length; i++) {
//     const change = candles[i].close - candles[i - 1].close
//     if (change > 0) {
//       avgGain = (avgGain * (period - 1) + change) / period
//       avgLoss = (avgLoss * (period - 1)) / period
//     } else {
//       avgLoss = (avgLoss * (period - 1) - change) / period
//       avgGain = (avgGain * (period - 1)) / period
//     }
//     rs = avgLoss === 0 ? 100 : avgGain / avgLoss
//     const curRSI = 100 - 100 / (1 + rs)
//     rsi.push({
//       time: candles[i].time as unknown as UTCTimestamp,
//       value: curRSI
//     })
//   }

//   const result: Array<{ time: UTCTimestamp; value: number }> = []
//   for (let i = 0; i < candles.length; i++) {
//     if (i < period) {
//       result.push({
//         time: candles[i].time as unknown as UTCTimestamp,
//         value: NaN
//       })
//     } else {
//       const idx = i - period
//       result.push({ time: rsi[idx].time, value: rsi[idx].value })
//     }
//   }
//   return result
// }

// function addHorizontalLine(
//   chart: IChartApi | null,
//   value: number,
//   color: string,
//   data: Candle[]
// ) {
//   if (!chart || !data.length) return
//   const lineSeries = chart.addLineSeries({
//     color,
//     lineWidth: 1,
//     lineStyle: LineStyle.Dotted
//   })
//   lineSeries.setData([
//     { time: data[0].time as unknown as UTCTimestamp, value },
//     { time: data[data.length - 1].time as unknown as UTCTimestamp, value }
//   ])
// }

// function syncTimeScale(chartA: IChartApi | null, chartB: IChartApi | null) {
//   if (!chartA || !chartB) return
//   const tsA = chartA.timeScale()
//   const tsB = chartB.timeScale()
//   let isSyncingA = false
//   let isSyncingB = false

//   tsA.subscribeVisibleLogicalRangeChange(range => {
//     if (isSyncingB || !range) return
//     isSyncingA = true
//     tsB.setVisibleLogicalRange(range)
//     isSyncingA = false
//   })

//   tsB.subscribeVisibleLogicalRangeChange(range => {
//     if (isSyncingA || !range) return
//     isSyncingB = true
//     tsA.setVisibleLogicalRange(range)
//     isSyncingB = false
//   })
// }
