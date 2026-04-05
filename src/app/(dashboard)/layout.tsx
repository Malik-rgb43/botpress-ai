'use client'

import DashboardSidebar from '@/components/layout/dashboard-sidebar'
import { EscalationProvider } from '@/components/providers/escalation-provider'
import { useEscalationContext } from '@/components/providers/escalation-provider'
import { useBusiness } from '@/hooks/use-business'
import { useTranslation } from '@/i18n/provider'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

function TopBar() {
  const { business } = useBusiness()
  const { pendingCount } = useEscalationContext()
  const { t } = useTranslation()

  return (
    <header className="h-14 bg-white border-b border-gray-200/60 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <h2 className="text-[15px] font-semibold text-gray-800 tracking-tight">
          {business?.name || 'BotPress AI'}
        </h2>
      </div>
      <Link
        href="/dashboard/conversations?status=needs_agent"
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-[18px] w-[18px]" />
        {pendingCount > 0 && (
          <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </Link>
    </header>
  )
}

function MobileHeader() {
  const { pendingCount } = useEscalationContext()
  const { t } = useTranslation()

  return (
    <header className="md:hidden h-14 bg-white border-b border-gray-200/60 px-4 flex items-center justify-between sticky top-0 z-40">
      <Sheet>
        <SheetTrigger
          aria-label={t.nav.nav_menu}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] p-0 border-0" showCloseButton={false}>
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      <Link href="/dashboard" className="flex items-center gap-2.5">
        <Image src="/images/logo.png" alt="BotPress AI" width={28} height={28} className="rounded-lg" />
        <span className="font-bold text-gray-900 text-[15px]">BotPress AI</span>
      </Link>

      <Link
        href="/dashboard/conversations?status=needs_agent"
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Bell className="h-[18px] w-[18px]" />
        {pendingCount > 0 && (
          <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </Link>
    </header>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { dir } = useTranslation()

  return (
    <EscalationProvider>
      <div className="flex min-h-screen bg-[#f8fafc]" dir={dir}>
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader />
          <div className="hidden md:block">
            <TopBar />
          </div>
          <main className="flex-1 p-5 md:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </EscalationProvider>
  )
}
