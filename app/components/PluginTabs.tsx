'use client'

import React, { useState } from 'react'
import styles from './PluginTabs.module.css'

const TABS = ['Plugins', 'Chat', 'NIN Tokens', 'Bots']

export default function PluginTabs() {
  const [activeTab, setActiveTab] = useState<string>(TABS[0])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Plugins':
        return <div>Load plugins here (mock for now)...</div>
      case 'Chat':
        return <div>Group chat, no spams...</div>
      case 'NIN Tokens':
        return <div>Token earnings history data goes here...</div>
      case 'Bots':
        return <div>Bots and stratigies goes here...</div>
      default:
        return null
    }
  }

  return (
    <div className={styles.tabsContainer}>
      <ul className={styles.tabList}>
        {TABS.map(tab => (
          <li
            key={tab}
            className={`${styles.tabItem} ${
              tab === activeTab ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  )
}
