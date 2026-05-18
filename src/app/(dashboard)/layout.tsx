import { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'Dashboard - Ha Long Booking',
  description: 'Manage your vacation apartments',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72 flex flex-col h-screen">
        <Header />
        <div className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-zinc-900">
          {children}
        </div>
      </main>
    </div>
  )
}
