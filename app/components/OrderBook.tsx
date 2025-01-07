// app/components/OrderBook.tsx
'use client'
import React, { useEffect, useState } from 'react'

interface OrderItem {
  price: number
  size: number
}

interface OrderBookData {
  bids: OrderItem[]
  asks: OrderItem[]
}

export default function OrderBook() {
  const [data, setData] = useState<OrderBookData>({ bids: [], asks: [] })

  useEffect(() => {
    // Example: fetch from /api/orderbook
    fetch('/api/orderbook')
      .then(res => res.json())
      .then(ob => setData(ob))
      .catch(err => console.error('Orderbook fetch error:', err))
  }, [])

  return (
    <div style={{ padding: '0.5rem' }}>
      <h4>Order Book</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <strong>Bids</strong>
          {data.bids.map((bid, idx) => (
            <div key={idx}>
              {bid.price} / {bid.size}
            </div>
          ))}
        </div>
        <div>
          <strong>Asks</strong>
          {data.asks.map((ask, idx) => (
            <div key={idx}>
              {ask.price} / {ask.size}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
