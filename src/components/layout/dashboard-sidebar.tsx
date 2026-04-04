'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  LayoutDashboard,
  HelpCircle,
  FileText,
  MessageSquare,
  Settings,
  TestTube,
  BarChart3,
  Code,
  CreditCard,
  Bot,
  LogOut,
  Users,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'אנליטיקס', icon: BarChart3 },
  { href: '/dashboard/faq', label: 'שאלות נפוצות', icon: HelpCircle },
  { href: '/dashboard/policies', label: 'מדיניות', icon: FileText },
  { href: '/dashboard/templates', label: 'טון ותבניות', icon: MessageSquare },
  { href: '/dashboard/playground', label: 'נסה את הבוט', icon: TestTube },
  { href: '/dashboard/conversations', label: 'שיחות', icon: Users },
  { href: '/dashboard/widget', label: 'וידג׳ט צ׳אט', icon: Code },
  { href: '/dashboard/plan', label: 'תוכנית', icon: CreditCard },
  { href: '/dashboard/settings', label: 'הגדרות', icon: Settings },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { business, loading: bizLoading } = useBusiness()

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-sm border-l border-blue-100/60 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-blue-100/60">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="BotPress AI" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-bold">BotPress AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Setup CTA */}
      {!bizLoading && !business && (
        <div className="px-3 pb-3">
          <Link href="/onboarding">
            <Button className="w-full gradient-animated border-0 text-white shadow-md shadow-blue-500/20 text-sm">
              <Sparkles className="h-4 w-4 ml-1" />
              הגדר את העסק שלך
            </Button>
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-blue-100/60">
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-gray-500 hover:text-blue-600"
        >
          <LogOut className="h-4 w-4 ml-2" />
          התנתק
        </Button>
      </div>
    </aside>
  )
}
