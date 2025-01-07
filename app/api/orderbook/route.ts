// app/api/orderbook/route.ts

import { NextResponse } from 'next/server'

interface OrderItem {
  price: number
  size: number
}
interface OrderBook {
  bids: OrderItem[]
  asks: OrderItem[]
}

export async function GET() {
  const orderbook: OrderBook = {
    bids: [
      { price: 101.5, size: 2.0 },
      { price: 101.4, size: 1.5 },
      { price: 101.3, size: 2.2 },
      { price: 101.2, size: 0.8 },
      { price: 101.1, size: 3.1 }
    ],
    asks: [
      { price: 101.6, size: 1.0 },
      { price: 101.7, size: 2.5 },
      { price: 101.8, size: 1.2 },
      { price: 101.9, size: 2.7 },
      { price: 102.0, size: 0.9 }
    ]
  }

  return NextResponse.json(orderbook)
}
