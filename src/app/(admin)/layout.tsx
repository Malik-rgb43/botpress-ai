import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Users, BarChart3, ArrowRight } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#f8fafd]">
      <aside className="w-64 bg-white border-l border-blue-100/60 flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-blue-100/60">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="BotPress AI" width={28} height={28} className="rounded-md" />
            <span className="text-lg font-bold">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-black hover:bg-gray-50">
            <LayoutDashboard className="h-4 w-4" />
            <span>סקירה</span>
          </Link>
          <Link href="/admin/businesses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-black hover:bg-gray-50">
            <Users className="h-4 w-4" />
            <span>עסקים</span>
          </Link>
          <Link href="/admin/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-black hover:bg-gray-50">
            <BarChart3 className="h-4 w-4" />
            <span>אנליטיקס</span>
          </Link>
        </nav>
        <div className="p-3 border-t border-blue-100/60">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-black">
            <ArrowRight className="h-4 w-4" />
            חזרה לדשבורד
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
