'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BusinessItem {
  id: string
  name: string
  tone: string
  created_at: string
  user_id: string
}

export default function BusinessesListPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('businesses').select('*').order('created_at', { ascending: false })
      setBusinesses(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">כל העסקים</h1>
      {businesses.length === 0 ? (
        <Card className="border-gray-100 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500">אין עסקים רשומים עדיין</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {businesses.map(biz => (
            <Link key={biz.id} href={`/admin/businesses/${biz.id}`}>
              <Card className="border-gray-100 shadow-none hover:border-gray-200 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{biz.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(biz.created_at).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{biz.tone}</Badge>
                    <ArrowLeft className="h-4 w-4 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
