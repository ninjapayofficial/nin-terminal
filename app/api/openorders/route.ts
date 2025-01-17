// app/api/openorders/route.ts

import { NextResponse } from 'next/server'

interface OpenOrder {
  time: string // e.g. "2023-01-01 09:30:00"
  side: 'BUY' | 'SELL'
  limitPrice: number
  size: number
  symbol: string
  stopLoss: number 
  takeProfit: number
}

export async function GET() {
  const openorders: OpenOrder[] = [
    { time: '2023-01-01 09:30:00', side: 'BUY', limitPrice: 800.5, size: 1.0, symbol: 'paytm.ns', stopLoss: 700.5, takeProfit: 877.0 },
    { time: '2023-01-01 09:31:15', side: 'SELL', limitPrice: 1001.2, size: 0.5, symbol: 'paytm.ns', stopLoss: 1200.5, takeProfit: 877.0 },
    { time: '2023-01-01 09:33:00', side: 'BUY', limitPrice: 18.0, size: 2.0, symbol: 'yesbank.ns', stopLoss: 17.5, takeProfit: 22.11 }
  ]

  return NextResponse.json(openorders)
}
