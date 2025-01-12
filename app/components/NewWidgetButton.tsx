'use client'

export function NewWidgetButton() {
  return (
    <span
      onClick={() => {
        window.dispatchEvent(new Event('open-widget-drawer'))
      }}
      className="text-gray-700 hover:underline cursor-pointer"
      style={{ borderRadius: 0, padding: '4px' }}
    >
      <span className="flex" style={{ color: '#88a1ac82' }}>
        New Widget
      </span>
    </span>
  )
}
