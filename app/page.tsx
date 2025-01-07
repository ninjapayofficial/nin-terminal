// app/page.tsx (server component, or client, either is fine)
import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Redirect user to /paytm.ns
  redirect('/paytm.ns')
}
