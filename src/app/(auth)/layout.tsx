import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Ha Long Booking',
  description: 'Authentication for Ha Long Booking system',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
      {children}
    </div>
  )
}
