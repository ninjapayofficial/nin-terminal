// app/[symbol]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import GridLayout from 'react-grid-layout'

import TerminalTabs from '../components/TerminalTabs'
import PluginTabs from '../components/PluginTabs'
import OrderBook from '../components/OrderBook'
import Watchlist from '../components/Watchlist'
import BuySell from '../components/BuySell'
import AdvancedChart from '../components/AdvancedChart'
import Image from 'next/image'
import ScriptEditor from '../components/ScriptEditor' // Import the new component

import styles from './symbolPage.module.css'

/** ========== 1) Types for RGL ========== */
interface RGLLayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  static?: boolean
  minW?: number
  maxW?: number
  minH?: number
  maxH?: number
  moved?: boolean
  isDraggable?: boolean
  isResizable?: boolean
}

type RGLLayout = RGLLayoutItem[]

/** ========== 2) Default Layout ========== */
const defaultLayout: RGLLayout = [
  { i: 'chartArea', x: 0, y: 0, w: 8, h: 16 },
  { i: 'tabsAreaTop', x: 0, y: 10, w: 8, h: 4 },
  { i: 'orderBook', x: 8, y: 0, w: 2, h: 12 },
  { i: 'watchlist', x: 10, y: 0, w: 2, h: 12 },
  { i: 'buySell', x: 8, y: 6, w: 4, h: 8 },
  { i: 'tabsAreaBottom', x: 0, y: 14, w: 12, h: 4 }
]

export default function SymbolPage() {
  /** ========== Symbol Param ========== */
  const routeParams = useParams() as { symbol?: string }
  const symbol = routeParams.symbol ?? 'paytm.ns'

  /** ========== Chat Drawer ========== */
  const [drawerOpen, setDrawerOpen] = useState(false)
  const handleChatClick = () => setDrawerOpen(!drawerOpen)
  const handleOverlayClick = () => setDrawerOpen(false)

  /** ========== Widget Drawer ========== */
  const [widgetDrawerOpen, setWidgetDrawerOpen] = useState(false)

  /**
   * We'll store a "widgetMap" that associates each item key (i) with a widget type.
   * Example: widgetMap["new-item-1673"] = "orderBook"
   */
  const [widgetMap, setWidgetMap] = useState<Record<string, string>>({})

  /** ========== Layout State ========== */
  const [layout, setLayout] = useState<RGLLayout>(defaultLayout)

  /** ========== Chart Data Fetch ========== */
  const [chartData, setChartData] = useState<any[]>([])
  useEffect(() => {
    fetch(`/api/chart?symbol=${symbol}`)
      .then(res => res.json())
      .then(data => setChartData(data))
      .catch(err => console.error('Error fetching chart data:', err))
  }, [symbol])

  /** ========== Window Resize ========== */
  const [gridWidth, setGridWidth] = useState<number>(1200)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGridWidth(window.innerWidth)
      const handleResize = () => setGridWidth(window.innerWidth)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  /** ========== Listen for "open-widget-drawer" from Header (if any) ========== */
  useEffect(() => {
    const handleOpenDrawer = () => setWidgetDrawerOpen(true)
    window.addEventListener('open-widget-drawer', handleOpenDrawer)
    return () => {
      window.removeEventListener('open-widget-drawer', handleOpenDrawer)
    }
  }, [])

  /** ========== Toggle Widget Drawer ========== */
  const toggleWidgetDrawer = () => setWidgetDrawerOpen(!widgetDrawerOpen)

  /** ========== RGL: onDrop callback ========== */
  const onDrop = (
    currentLayout: RGLLayout,
    droppedItem: RGLLayoutItem,
    e: MouseEvent
  ) => {
    const newKey = `new-item-${Date.now()}`

    // RGL automatically appended droppedItem to currentLayout
    // We'll rename its key:
    const updatedLayout = currentLayout.map(item =>
      item === droppedItem ? { ...item, i: newKey } : item
    )
    setLayout(updatedLayout)

    // Assign the dragged widget type:
    if (dragType) {
      setWidgetMap(prev => ({
        ...prev,
        [newKey]: dragType
      }))
    }
    // Clear the global "dragType"
    setDragType(null)

    // (ADDED) Done dropping external widget => hide dustbin
    setIsDragging(false)
  }

  /**
   * We'll store which widget type the user is dragging
   * in a top-level state "dragType".
   */
  const [dragType, setDragType] = useState<string | null>(null)
  // (ADDED) In addition, we set isDragging to true so dustbin shows.
  const handleDragStart = (widget: string) => {
    setDragType(widget)
    setIsDragging(true) // (ADDED)
  }

  // NEW: We'll hold the user's custom code in state
  const [userScriptCode, setUserScriptCode] = useState<string | null>(null)

  /** ========== DRAG-TO-DELETE State ========== */
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItemKey, setDraggedItemKey] = useState<string | null>(null)

  return (
    <div>
      {/* ========== MAIN GRID ========== */}
      <GridLayout
        className="layout"
        layout={layout}
        onDrop={onDrop}
        isDroppable={true}
        droppingItem={{ i: 'widget', w: 3, h: 6 }}
        cols={12}
        rowHeight={30}
        width={gridWidth}
        margin={[7, 7]}
        containerPadding={[7, 7]}
        isDraggable={true}
        isResizable={true}
        /** ---- The Key: We use .myDragHandle as the handle ---- */
        draggableHandle=".myDragHandle"
        useCSSTransforms={true}
        /** ========== DRAG-TO-DELETE Callbacks ========== */
        onDragStart={(layout, oldItem) => {
          setIsDragging(true)
          setDraggedItemKey(oldItem.i)
        }}
        onDragStop={(layout, oldItem, newItem, placeholder, e) => {
          setIsDragging(false)

          // Check if dropped over dustbin:
          const dustbinEl = document.getElementById('dustbin')
          if (dustbinEl) {
            const dustbinRect = dustbinEl.getBoundingClientRect()
            const x = e.clientX
            const y = e.clientY

            if (
              x >= dustbinRect.left &&
              x <= dustbinRect.right &&
              y >= dustbinRect.top &&
              y <= dustbinRect.bottom
            ) {
              // Remove the dragged item from layout
              setLayout(prev => prev.filter(li => li.i !== oldItem.i))
            }
          }
          setDraggedItemKey(null)
        }}
      >
        {layout.map(item => {
          // If there's an entry in widgetMap, it's a new/dynamic item
          const dynamicWidget = widgetMap[item.i]

          return (
            <div key={item.i} className={styles.dynamicItemContainer}>
              {/* 
                1) "Drag Handle" bar at the top
                => same style as in your working snippet
              */}
              <div
                className="myDragHandle"
                style={{
                  background: '#88a1ac08',
                  color: '#fff',
                  padding: '6px',
                  cursor: 'move',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  zIndex: 999
                }}
              >
                {/* We keep your "☰" icon so UI stays the same! */}☰
              </div>

              {dynamicWidget ? (
                <>
                  {dynamicWidget === 'chart' && (
                    <AdvancedChart
                      data={chartData}
                      symbol={symbol}
                      userScriptCode={userScriptCode}
                    />
                  )}
                  {dynamicWidget === 'orderBook' && <OrderBook />}
                  {dynamicWidget === 'watchlist' && <Watchlist />}
                  {dynamicWidget === 'buySell' && <BuySell symbol={symbol} />}
                  {dynamicWidget === 'tabs' && <TerminalTabs />}
                  {dynamicWidget === 'scriptEditor' && (
                    // The script editor. On "Apply," we store code in userScriptCode.
                    <ScriptEditor
                      onApply={scriptCode => setUserScriptCode(scriptCode)}
                    />
                  )}
                </>
              ) : (
                /** Otherwise, it's one of your default items by key */
                <>
                  {item.i === 'chartArea' && (
                    <AdvancedChart
                      data={chartData}
                      symbol="PAYTM.NS"
                      userScriptCode={userScriptCode}
                    />
                  )}
                  {item.i === 'tabsAreaTop' && <PluginTabs />}
                  {item.i === 'orderBook' && <OrderBook />}
                  {item.i === 'watchlist' && <Watchlist />}
                  {item.i === 'buySell' && <BuySell symbol={symbol} />}
                  {item.i === 'tabsAreaBottom' && <TerminalTabs />}
                </>
              )}
            </div>
          )
        })}
      </GridLayout>

      {/* ========== Dustbin (only visible while dragging) ========== */}
      {isDragging && (
        <div
          id="dustbin"
          style={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* A dustbin icon or text */}
          <span style={{ fontSize: 24 }}>🗑</span>
        </div>
      )}

      {/* ========== Additional TABS Below ========== */}
      <div className={styles.terminalTabs}>
        <TerminalTabs />
      </div>

      {/* ========== FLOATING CHAT BUTTON ========== */}
      <button className={styles.chatButton} onClick={handleChatClick}>
        <Image
          src="/chat-ai.svg"
          alt="NINtrade Stockbot Icon"
          width={28}
          height={28}
          priority={true}
        />
      </button>
      {drawerOpen && (
        <div className={styles.overlay} onClick={handleOverlayClick}></div>
      )}
      <div
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
      >
        <iframe
          src="https://stockbot.nin.in/"
          className={styles.iframeContainer}
          title="StockBot Chat"
        ></iframe>
      </div>

      {/* ========== "Add Widget" Button ========== */}
      {/* <button className={styles.addWidgetButton} onClick={toggleWidgetDrawer}>
        Add Widget
      </button> */}

      {widgetDrawerOpen && (
        <div className={styles.widgetDrawer}>
          {/* Drawer Header with Close Button */}
          <div className={styles.widgetDrawerHeader}>
            <h3>Widgets</h3>
            <button className={styles.closeButton} onClick={toggleWidgetDrawer}>
              ✕
            </button>
          </div>
          <p>Drag an item below onto the grid:</p>

          <div
            className={styles.widgetDraggable}
            draggable
            onDragStart={() => handleDragStart('chart')}
          >
            <Image
              src="/chat-ai.svg"
              alt="Chart Widget"
              width={100}
              height={60}
            />
            <span>Chart</span>
          </div>

          <div
            className={styles.widgetDraggable}
            draggable
            onDragStart={() => handleDragStart('orderBook')}
          >
            <Image
              src="/placeholder-orderbook.png"
              alt="OrderBook Widget"
              width={100}
              height={60}
            />
            <span>OrderBook</span>
          </div>

          <div
            className={styles.widgetDraggable}
            draggable
            onDragStart={() => handleDragStart('watchlist')}
          >
            <Image
              src="/placeholder-watchlist.png"
              alt="Watchlist Widget"
              width={100}
              height={60}
            />
            <span>Watchlist</span>
          </div>

          <div
            className={styles.widgetDraggable}
            draggable
            onDragStart={() => handleDragStart('buySell')}
          >
            <Image
              src="/placeholder-buysell.png"
              alt="BuySell Widget"
              width={100}
              height={60}
            />
            <span>Buy/Sell</span>
          </div>

          <div
            className={styles.widgetDraggable}
            draggable
            onDragStart={() => handleDragStart('tabs')}
          >
            <Image
              src="/placeholder-tabs.png"
              alt="Tabs Widget"
              width={100}
              height={60}
            />
            <span>Plugin Tabs</span>
          </div>

          <div
            className={styles.widgetDraggable}
            draggable
            onDragStart={() => handleDragStart('scriptEditor')}
          >
            <Image
              src="/placeholder-editor.png"
              alt="Indicator Editor"
              width={100}
              height={60}
            />
            <span>Indicator Editor</span>
          </div>
        </div>
      )}
    </div>
  )
}
