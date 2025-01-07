// app/api/trades/route.ts

import { NextResponse } from 'next/server'

interface Trade {
  time: string // e.g. "2023-01-01 09:30:00"
  side: 'BUY' | 'SELL'
  price: number
  size: number
}

export async function GET() {
  const trades: Trade[] = [
    { time: '2023-01-01 09:30:00', side: 'BUY', price: 100.5, size: 1.0 },
    { time: '2023-01-01 09:31:15', side: 'SELL', price: 101.2, size: 0.5 },
    { time: '2023-01-01 09:33:00', side: 'BUY', price: 102.0, size: 2.0 }
  ]

  return NextResponse.json(trades)
}
