// app/components/ScriptEditor.tsx
'use client'

import React, { useState } from 'react'
import Editor from '@monaco-editor/react'

interface ScriptEditorProps {
  // Called when the user clicks "Apply"
  onApply: (scriptCode: string) => void
}

export default function ScriptEditor({ onApply }: ScriptEditorProps) {
  const [code, setCode] = useState(`
// Example user script
function main(data) {
  // data: array of candles = [{time, open, high, low, close, volume}, ...]
  // Return array of { time, value } to plot

  // For instance, a naive 14-bar SMA:
  let period = 14
  let results = []
  let sum = 0
  for (let i = 0; i < data.length; i++) {
    sum += data[i].close
    if (i >= period) {
      sum -= data[i - period].close
    }
    if (i >= period - 1) {
      results.push({
        time: data[i].time,
        value: sum / period
      })
    } else {
      results.push({
        time: data[i].time,
        value: NaN
      })
    }
  }
  return results
}
  `)

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
    }
  }

  const handleApply = () => {
    onApply(code)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Editor
        value={code}
        language="javascript"
        height="calc(100% - 40px)"
        theme="vs-dark"
        onChange={handleEditorChange}
      />
      <button onClick={handleApply} style={{ height: 40, marginTop: 4 }}>
        Apply
      </button>
    </div>
  )
}
