'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export function Header() {
  const [email, setEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setEmail(user.email ?? null)
    }
    getUser()
  }, [supabase])

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border-b">
      <div className="flex items-center">
        {/* Mobile menu button would go here */}
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center gap-x-4">
        <div className="text-sm font-medium text-muted-foreground hidden sm:block">
          {email}
        </div>
        <Avatar>
          <AvatarImage src="" />
          <AvatarFallback>{email ? email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
