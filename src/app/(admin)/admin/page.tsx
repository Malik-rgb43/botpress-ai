'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MessageSquare, Building2, AlertTriangle, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState({ businesses: 0, users: 0, conversations: 0, escalations: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [biz, conv] = await Promise.all([
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        businesses: biz.count || 0,
        users: biz.count || 0,
        conversations: conv.count || 0,
        escalations: 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">עסקים רשומים</CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.businesses}</div></CardContent>
        </Card>
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">משתמשים</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.users}</div></CardContent>
        </Card>
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">שיחות</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.conversations}</div></CardContent>
        </Card>
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">העברות לנציג</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.escalations}</div></CardContent>
        </Card>
      </div>
    </div>
  )
}
