'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, LayoutDashboard, Users, Building, FileText, LogOut, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

const routes = [
  {
    label: 'Lịch Booking',
    icon: Calendar,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Danh sách Booking',
    icon: FileText,
    href: '/dashboard/bookings',
    color: 'text-violet-500',
  },
  {
    label: 'Báo cáo Doanh thu',
    icon: BarChart3,
    href: '/dashboard/reports',
    color: 'text-emerald-500',
  },
  {
    label: 'Quản lý Căn hộ',
    icon: Building,
    href: '/dashboard/apartments',
    color: 'text-pink-700',
  },
  {
    label: 'Cộng tác viên',
    icon: Users,
    href: '/dashboard/collaborators',
    color: 'text-orange-700',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <LayoutDashboard className="h-8 w-8 text-sky-500 mr-2" />
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
                pathname === route.href ? 'text-white bg-white/10' : 'text-zinc-400'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3">
        <button
          onClick={handleLogout}
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          <div className="flex items-center flex-1">
            <LogOut className="h-5 w-5 mr-3 text-red-500" />
            Đăng xuất
          </div>
        </button>
      </div>
    </div>
  )
}
