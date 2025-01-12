// // app/components/Header.tsx
// 'use client'

// import React from 'react'
// import Link from 'next/link'
// import Image from 'next/image'

// function cn(...classes: (string | boolean | undefined)[]): string {
//   return classes.filter(Boolean).join(' ')
// }

// function IconSeparator({ className }: { className?: string }) {
//   return <span className={cn('mx-2', className)}>|</span>
// }

// async function UserOrLogin() {
//   return (
//     <>
//       <Link href="https://nin.in/trade/" rel="nofollow">
//         <Image
//           src="/logo_trade_light_baseline.svg"
//           alt="NINtrade Logo"
//           width={100}
//           height={30}
//           priority={true}
//         />
//       </Link>

//       <div className="flex items-center font-semibold">
//         <IconSeparator className="text-gray-500" />
//         <Link href="/new">Terminal</Link>
//         <IconSeparator className="text-gray-500" />

//         {/* Dispatch an event so SymbolPage can open the drawer */}
//         <span
//           onClick={() => {
//             window.dispatchEvent(new Event('open-widget-drawer'))
//           }}
//           className="text-gray-700 hover:underline cursor-pointer"
//           style={{ borderRadius: 0, padding: '4px' }}
//         >
//           <span className="flex" style={{ color: '#88a1ac82' }}>
//             New Widget
//           </span>
//         </span>
//       </div>
//     </>
//   )
// }

// export function Header() {
//   return (
//     <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b border-gray-700 bg-gradient-to-b from-black-900 via-black-800 to-gray-700 text-white backdrop-blur-xl">
//       <div className="flex items-center">
//         <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
//           <UserOrLogin />
//         </React.Suspense>
//       </div>
//     </header>
//   )
// }
