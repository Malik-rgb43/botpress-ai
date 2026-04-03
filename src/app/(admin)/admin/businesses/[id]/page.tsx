'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight, Building2, HelpCircle, FileText, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import type { Business, FAQ, Policy } from '@/types/database'

export default function BusinessDetailPage() {
  const params = useParams()
  const [business, setBusiness] = useState<Business | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const id = params.id as string
      const [bizRes, faqRes, polRes] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', id).single(),
        supabase.from('faqs').select('*').eq('business_id', id).order('order'),
        supabase.from('policies').select('*').eq('business_id', id),
      ])
      setBusiness(bizRes.data)
      setFaqs(faqRes.data || [])
      setPolicies(polRes.data || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
  }

  if (!business) {
    return <p className="text-gray-500 text-center py-12">העסק לא נמצא</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/businesses">
          <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {business.name}
          </h1>
          <p className="text-gray-400 text-sm">ID: {business.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-100 shadow-none">
          <CardHeader><CardTitle className="text-lg">פרטי עסק</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-gray-500">שם:</span> {business.name}</div>
            <div><span className="text-gray-500">טון:</span> <Badge variant="outline">{business.tone}</Badge></div>
            <div><span className="text-gray-500">טלפון:</span> {business.contact_info?.phone || '—'}</div>
            <div><span className="text-gray-500">אימייל:</span> {business.contact_info?.email || '—'}</div>
            {business.story && <div><span className="text-gray-500">סיפור:</span> <p className="mt-1 text-gray-700">{business.story}</p></div>}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><HelpCircle className="h-5 w-5" />שאלות נפוצות</CardTitle>
            <Badge variant="secondary">{faqs.length}</Badge>
          </CardHeader>
          <CardContent>
            {faqs.length === 0 ? (
              <p className="text-gray-400 text-sm">אין שאלות</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {faqs.map(f => (
                  <div key={f.id} className="text-sm">
                    <p className="font-medium">{f.question}</p>
                    <p className="text-gray-500">{f.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />מדיניות</CardTitle>
            <Badge variant="secondary">{policies.length}</Badge>
          </CardHeader>
          <CardContent>
            {policies.length === 0 ? (
              <p className="text-gray-400 text-sm">אין מדיניות</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {policies.map(p => (
                  <div key={p.id} className="text-sm">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-gray-500 line-clamp-2">{p.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
