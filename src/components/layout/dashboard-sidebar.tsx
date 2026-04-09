'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  HelpCircle,
  FileText,
  MessageSquare,
  Settings,
  TestTube,
  BarChart3,
  Code,
  CreditCard,
  LogOut,
  Users,
  Sparkles,
  AlertTriangle,
  Bell,
  BellOff,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useBusiness } from '@/hooks/use-business'
import { useEscalationContext } from '@/components/providers/escalation-provider'
import { useTranslation } from '@/i18n/provider'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { business, loading: bizLoading } = useBusiness()
  const { pendingCount, notificationsEnabled, enableNotifications } = useEscalationContext()
  const { t } = useTranslation()

  const NAV_ITEMS = [
    { href: '/dashboard', label: t.nav.analytics, icon: BarChart3 },
    { href: '/dashboard/faq', label: t.nav.faq, icon: HelpCircle },
    { href: '/dashboard/policies', label: t.nav.policies, icon: FileText },
    { href: '/dashboard/templates', label: t.nav.templates, icon: MessageSquare },
    { href: '/dashboard/playground', label: t.nav.playground, icon: TestTube },
    { href: '/dashboard/conversations', label: t.nav.conversations, icon: Users },
    { href: '/dashboard/widget', label: t.nav.widget, icon: Code },
    { href: '/dashboard/plan', label: t.nav.plan, icon: CreditCard },
    { href: '/dashboard/settings', label: t.nav.settings, icon: Settings },
  ]

  const userInitial = business?.name?.charAt(0)?.toUpperCase() || 'B'

  return (
    <motion.aside
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-[260px] bg-gradient-to-b from-white to-gray-50/30 border-l border-gray-200/80 flex flex-col h-screen sticky top-0 max-md:w-full max-md:h-full max-md:border-l-0"
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <Link href="/dashboard" className="group flex items-center gap-2.5 relative">
          <Image src="/images/logo.png" alt="BotPress AI" width={30} height={30} className="rounded-lg" />
          <span className="text-[17px] font-bold text-gray-900 tracking-tight">BotPress AI</span>
          <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-gradient-to-l from-blue-500 to-indigo-400 rounded-full transition-all duration-300 group-hover:w-full" />
        </Link>
        <button
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
          }}
          className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={t.nav.close_menu}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Pending escalations alert */}
      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="px-3 pt-3"
          >
            <Link href="/dashboard/conversations?status=needs_agent">
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200/60 hover:border-red-300 transition-all cursor-pointer shadow-[0_0_12px_-3px_rgba(239,68,68,0.25)] hover:shadow-[0_0_18px_-3px_rgba(239,68,68,0.35)]">
                <div className="relative shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-red-700">
                    {pendingCount} {pendingCount === 1 ? t.nav.pending_one : t.nav.pending_many}
                  </p>
                  <p className="text-[11px] text-red-500/80">{t.nav.click_to_view}</p>
                </div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shrink-0" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          const showBadge = item.href === '/dashboard/conversations' && pendingCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] transition-all duration-150 relative',
                isActive
                  ? 'bg-blue-50/80 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50/80'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Setup CTA */}
      {!bizLoading && !business && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="px-3 pb-2"
        >
          <Link href="/onboarding">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 border-0 text-white shadow-sm rounded-xl text-sm h-10">
              <Sparkles className="h-4 w-4 ml-1.5" />
              {t.nav.setup_business}
            </Button>
          </Link>
        </motion.div>
      )}

      {/* User section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="px-3 py-3 border-t border-gray-100 space-y-2"
      >
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-gray-800 truncate">
              {business?.name || t.nav.my_business}
            </p>
          </div>
          <button
            onClick={async () => {
              if (notificationsEnabled) {
                toast.info(t.nav.notifications_on)
              } else {
                const ok = await enableNotifications()
                if (ok) toast.success(t.nav.notifications_enabled)
                else toast.error(t.nav.notifications_blocked)
              }
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              notificationsEnabled
                ? 'text-blue-500 bg-blue-50'
                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
            }`}
            title={notificationsEnabled ? t.nav.notifications_on_title : t.nav.enable_notifications}
            aria-label={notificationsEnabled ? t.nav.notifications_on_title : t.nav.enable_notifications}
          >
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </button>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title={t.nav.sign_out}
            aria-label={t.nav.sign_out}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.aside>
  )
}
