// app/components/Trades.tsx
'use client'

import React from 'react'

type SideType = 'BUY' | 'SELL'

interface Trade {
  time: string // e.g. "2023-01-01 09:30:00"
  side: SideType
  price: number
  size: number
}

interface TradesProps {
  data: Trade[]
}

export default function Trades({ data }: TradesProps) {
  return (
    <div style={{ border: '1px solid #444', padding: 8 }}>
      <h3>Trades</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Side</th>
            <th>Price</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {data.map((trade, idx) => (
            <tr key={idx} style={{ textAlign: 'center' }}>
              <td>{trade.time}</td>
              <td>{trade.side}</td>
              <td>{trade.price}</td>
              <td>{trade.size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
