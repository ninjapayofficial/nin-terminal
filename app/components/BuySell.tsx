// app/components/BuySell.tsx
'use client'

import React, { useState } from 'react'
import styles from './BuySell.module.css'

interface BuySellProps {
  symbol: string
}

const TABS = ['Market', 'Limit']

export default function BuySell({ symbol }: BuySellProps) {
  const [activeTab, setActiveTab] = useState<string>('Market')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')

  const handleBuy = () => {
    alert(`BUY ${amount} of ${symbol} at ${activeTab} price ${price || 'MKT'}`)
  }

  const handleSell = () => {
    alert(`SELL ${amount} of ${symbol} at ${activeTab} price ${price || 'MKT'}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabHeader}>
        {TABS.map(t => (
          <div
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab(t)
              if (t === 'Market') setPrice('')
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'Limit' && (
          <div className={styles.formRow}>
            <label>Price:</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="Enter limit price"
            />
          </div>
        )}
        <div className={styles.formRow}>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        <div className={styles.buttons}>
          <button className={styles.buyButton} onClick={handleBuy}>
            Buy
          </button>
          <button className={styles.sellButton} onClick={handleSell}>
            Sell
          </button>
        </div>
      </div>
    </div>
  )
}
