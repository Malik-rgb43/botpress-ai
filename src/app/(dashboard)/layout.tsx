'use client'

import DashboardSidebar from '@/components/layout/dashboard-sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#f8fafd]">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-blue-100/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="BotPress AI" width={28} height={28} className="rounded-md" />
            <span className="font-bold">BotPress AI</span>
          </Link>
          <Sheet>
            <SheetTrigger aria-label="תפריט ניווט" className="p-2 text-gray-500 hover:text-blue-600">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <DashboardSidebar />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
