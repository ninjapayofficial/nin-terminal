// app/components/OrderBook.tsx
'use client'

import React, { useEffect, useState, useRef } from 'react'
import styles from './OrderBook.module.css'
import throttle from 'lodash.throttle' // Ensure lodash.throttle is installed

interface OrderItem {
  price: number
  size: number
}

interface AggregatedOrderItem {
  price: number
  size: number
  count: number
}

interface OrderBookData {
  bids: OrderItem[]
  asks: OrderItem[]
}

export default function OrderBook() {
  const [data, setData] = useState<OrderBookData>({ bids: [], asks: [] })
  const [stepSize, setStepSize] = useState<number>(1) // Default step size
  const [aggregatedData, setAggregatedData] = useState<{ bids: AggregatedOrderItem[]; asks: AggregatedOrderItem[] }>({
    bids: [],
    asks: []
  })

  // Refs to manage scroll positions
  const asksListRef = useRef<HTMLDivElement>(null)
  const bidsListRef = useRef<HTMLDivElement>(null)

  // Throttled setData function to prevent excessive re-renders
  const throttledSetData = throttle((newData: OrderBookData) => {
    setData(newData)
  }, 100) // Throttle delay in ms

  useEffect(() => {
    let ws: WebSocket
    let reconnectTimer: NodeJS.Timeout
    let reconnectAttempts = 0

    const connectWebSocket = () => {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms')

      ws.onopen = () => {
        console.log('WebSocket connected to Binance (btcusdt@depth20@100ms)')
        reconnectAttempts = 0 // Reset attempts on successful connection
      }

      ws.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data)

          // Correctly reference 'bids' and 'asks'
          const bids: OrderItem[] = (messageData.bids || []).map((bid: string[]) => ({
            price: parseFloat(bid[0]),
            size: parseFloat(bid[1])
          }))

          const asks: OrderItem[] = (messageData.asks || []).map((ask: string[]) => ({
            price: parseFloat(ask[0]),
            size: parseFloat(ask[1])
          }))

          throttledSetData({ bids, asks })
        } catch (error) {
          console.error('Error parsing Binance order book data:', error)
        }
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
      }

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event)
        // Exponential backoff for reconnection
        const delay = Math.min(10000, 1000 * 2 ** reconnectAttempts) // Max 10 seconds
        reconnectTimer = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...')
          reconnectAttempts += 1
          connectWebSocket()
        }, delay)
      }
    }

    connectWebSocket()

    // Cleanup on component unmount
    return () => {
      ws.close()
      throttledSetData.cancel()
      if (reconnectTimer) clearTimeout(reconnectTimer)
    }
  }, [])

  // Helper function to limit rows
  const LIMIT = 10 // Maximum number of rows per side

  // Aggregate data based on step size whenever data or stepSize changes
  useEffect(() => {
    const aggregateOrders = (orders: OrderItem[]): AggregatedOrderItem[] => {
      const aggregated: Record<number, { size: number; count: number }> = {}

      orders.forEach(order => {
        // Round down the price to the nearest step size
        const roundedPrice = Math.floor(order.price / stepSize) * stepSize
        if (aggregated[roundedPrice]) {
          aggregated[roundedPrice].size += order.size
          aggregated[roundedPrice].count += 1
        } else {
          aggregated[roundedPrice] = { size: order.size, count: 1 }
        }
      })

      // Convert the aggregated object back to an array and sort
      const aggregatedArray: AggregatedOrderItem[] = Object.entries(aggregated).map(([price, { size, count }]) => ({
        price: parseFloat(price),
        size,
        count
      }))

      return aggregatedArray
    }

    let aggregatedBids = aggregateOrders(data.bids).sort((a, b) => b.price - a.price) // Descending
    let aggregatedAsks = aggregateOrders(data.asks).sort((a, b) => a.price - b.price) // Ascending

    // Ensure equal number of asks and bids, limited to LIMIT
    const minLength = Math.min(aggregatedBids.length, aggregatedAsks.length, LIMIT)
    aggregatedBids = aggregatedBids.slice(0, minLength)
    aggregatedAsks = aggregatedAsks.slice(0, minLength)

    // Pad with empty entries if less than LIMIT
    const padList = (list: AggregatedOrderItem[], limit: number): AggregatedOrderItem[] => {
      const padded = [...list]
      while (padded.length < limit) {
        padded.push({ price: 0, size: 0, count: 0 })
      }
      return padded
    }

    aggregatedBids = padList(aggregatedBids, LIMIT)
    aggregatedAsks = padList(aggregatedAsks, LIMIT)

    setAggregatedData({ bids: aggregatedBids, asks: aggregatedAsks })

    // After initial load, scroll asks to the bottom (best ask visible)
    if (asksListRef.current) {
      asksListRef.current.scrollTop = asksListRef.current.scrollHeight
    }

  }, [data, stepSize])

  // Determine maximum counts for scaling the background bars
  const maxBidCount = Math.max(...aggregatedData.bids.map(bid => bid.count), 1)
  const maxAskCount = Math.max(...aggregatedData.asks.map(ask => ask.count), 1)

  return (
    <div className={styles.orderBookContainer}>
      {/* Header with Title and Range Filter */}
      <div className={styles.header}>
        <span className={styles.title}>Order Book</span>
        {/* Range Filter */}
        <div className={styles.rangeFilter}>
          <select
            id="stepSize"
            value={stepSize}
            onChange={(e) => setStepSize(Number(e.target.value))}
            aria-label="Select Price Step"
          >
            <option value={100}>100</option>
            <option value={10}>10</option>
            <option value={1}>1</option>
            <option value={0.1}>0.1</option>
          </select>
        </div>
      </div>

      {/* Main Content: Asks, Separator, Bids */}
      <div className={styles.mainContent}>
        {/* Asks List */}
        <div className={styles.asksSection} ref={asksListRef}>
          {aggregatedData.asks.map((ask, idx) => {
            const widthPercent = (ask.count / maxAskCount) * 100
            return (
              <div
                key={idx}
                className={styles.orderRow}
                title={`Price: ${ask.count > 0 ? ask.price.toFixed(2) : '-'}, Size: ${ask.count > 0 ? ask.size.toFixed(2) : '-'}, Orders: ${ask.count > 0 ? ask.count : '-'}`}
              >
                {/* Background Bar */}
                <div
                  className={`${styles.backgroundBar} ${styles.askBar}`}
                  style={{ width: `${widthPercent}%` }}
                ></div>
                {/* Price */}
                <div className={styles.priceText}>
                  {ask.count > 0 ? ask.price.toFixed(2) : '-'}
                </div>
                {/* Amount */}
                <div className={styles.amountText}>
                  {ask.count > 0 ? (ask.price * ask.size).toFixed(2) : '-'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Separator Line with Best Ask and Bid */}
        <div className={styles.separatorContainer}>
          <div className={styles.bestAsk}>
            {aggregatedData.asks[0]?.count > 0 ? aggregatedData.asks[0].price.toFixed(2) : 'N/A'}
          </div>
          <div className={styles.separator}></div>
          <div className={styles.bestBid}>
            {aggregatedData.bids[0]?.count > 0 ? aggregatedData.bids[0].price.toFixed(2) : 'N/A'}
          </div>
        </div>

        {/* Bids List */}
        <div className={styles.bidsSection} ref={bidsListRef}>
          {aggregatedData.bids.map((bid, idx) => {
            const widthPercent = (bid.count / maxBidCount) * 100
            return (
              <div
                key={idx}
                className={styles.orderRow}
                title={`Price: ${bid.count > 0 ? bid.price.toFixed(2) : '-'}, Size: ${bid.count > 0 ? bid.size.toFixed(2) : '-'}, Orders: ${bid.count > 0 ? bid.count : '-'}`}
              >
                {/* Background Bar */}
                <div
                  className={`${styles.backgroundBar} ${styles.bidBar}`}
                  style={{ width: `${widthPercent}%` }}
                ></div>
                {/* Price */}
                <div className={styles.priceText}>
                  {bid.count > 0 ? bid.price.toFixed(2) : '-'}
                </div>
                {/* Amount */}
                <div className={styles.amountText}>
                  {bid.count > 0 ? (bid.price * bid.size).toFixed(2) : '-'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}