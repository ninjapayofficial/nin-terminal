// // app/components/Header.tsx
import { NewWidgetButton } from './NewWidgetButton'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

function IconSeparator({ className }: { className?: string }) {
  return <span className={`mx-2 ${className}`}>|</span>
}

export async function UserOrLogin() {
  return (
    <>
      <Link href="https://nin.in/trade/" rel="nofollow">
        <Image
          src="/logo_trade_light_baseline.svg"
          alt="NINtrade Logo"
          width={100}
          height={30}
          priority={true}
        />
      </Link>

      <div className="flex items-center font-semibold">
        <IconSeparator className="text-gray-500" />
        <Link href="/new">Terminal</Link>
        <IconSeparator className="text-gray-500" />
        <NewWidgetButton /> {/* Use Client Component here */}
      </div>
    </>
  )
}

// Header component
export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b border-gray-600 bg-gradient-to-b from-black-900 via-black-800 to-gray-700 text-white backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div>Loading...</div>}>
          <UserOrLogin />
        </React.Suspense>
      </div>
    </header>
  )
}
