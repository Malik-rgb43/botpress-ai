'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
// Select removed — using button chips instead
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { Policy } from '@/types/database'

const POLICY_TYPES = [
  { value: 'returns', label: 'החזרות והחלפות' },
  { value: 'shipping', label: 'משלוחים' },
  { value: 'hours', label: 'שעות פעילות' },
  { value: 'payment', label: 'אמצעי תשלום' },
  { value: 'custom', label: 'אחר' },
]

export default function PoliciesPage() {
  const { business, loading: bizLoading } = useBusiness()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Policy | null>(null)
  const [type, setType] = useState('returns')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!business) return
    loadPolicies()
  }, [business])

  async function loadPolicies() {
    const supabase = createClient()
    const { data } = await supabase.from('policies').select('*').eq('business_id', business!.id).order('created_at')
    setPolicies(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null); setType('returns'); setTitle(''); setContent('')
    setDialogOpen(true)
  }

  function openEdit(p: Policy) {
    setEditing(p); setType(p.type); setTitle(p.title); setContent(p.content)
    setDialogOpen(true)
  }

  async function save() {
    if (!title.trim() || !content.trim()) return
    const supabase = createClient()
    if (editing) {
      await supabase.from('policies').update({ type, title, content }).eq('id', editing.id)
      toast.success('המדיניות עודכנה')
    } else {
      await supabase.from('policies').insert({ business_id: business!.id, type, title, content })
      toast.success('המדיניות נוספה')
    }
    setDialogOpen(false)
    loadPolicies()
  }

  async function remove(id: string) {
    const supabase = createClient()
    await supabase.from('policies').delete().eq('id', id)
    toast.success('המדיניות נמחקה')
    loadPolicies()
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">צריך ליצור עסק קודם</p>
        <p className="text-gray-400 text-sm mt-1">עבור ל<a href="/onboarding" className="text-blue-500 hover:underline">הגדרת העסק</a></p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-balance">מדיניות העסק</h1>
          <p className="text-gray-500 text-sm mt-1">הגדר מדיניות החזרות, משלוחים, שעות פעילות ועוד</p>
        </div>
        <Button onClick={openCreate} className="bg-[#2e90fa] border-0 shadow-md shadow-[#2e90fa]/25 rounded-xl hover:shadow-lg transition-all"><Plus className="h-4 w-4 ml-1" />הוסף מדיניות</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'ערוך מדיניות' : 'מדיניות חדשה'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>סוג</Label>
                <div className="flex flex-wrap gap-2">
                  {POLICY_TYPES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setType(p.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        type === p.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                          : 'border-gray-200 text-gray-500 hover:border-blue-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>כותרת *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>תוכן *</Label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} />
              </div>
              <Button onClick={save} className="w-full bg-[#2e90fa] border-0 rounded-xl">{editing ? 'עדכן' : 'הוסף'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {policies.length === 0 ? (
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-blue-300 mb-3" />
            <p className="text-gray-500">עדיין אין מדיניות</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {policies.map(p => (
            <Card key={p.id} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-1 inline-block">
                    {POLICY_TYPES.find(pt => pt.value === p.type)?.label || p.type}
                  </span>
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.content}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4 text-gray-400" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-gray-400" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}