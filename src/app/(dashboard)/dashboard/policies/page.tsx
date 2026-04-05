'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
// Select removed — using button chips instead
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/provider'
import type { Policy } from '@/types/database'

export default function PoliciesPage() {
  const { t } = useTranslation()
  const { business, loading: bizLoading } = useBusiness()

  const POLICY_TYPES = [
    { value: 'returns', label: t.policies.type_returns },
    { value: 'shipping', label: t.policies.type_shipping },
    { value: 'hours', label: t.policies.type_hours },
    { value: 'payment', label: t.policies.type_payment },
    { value: 'custom', label: t.policies.type_custom },
  ]
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
      toast.success(t.policies.updated)
    } else {
      await supabase.from('policies').insert({ business_id: business!.id, type, title, content })
      toast.success(t.policies.added)
    }
    setDialogOpen(false)
    loadPolicies()
  }

  async function remove(id: string) {
    const supabase = createClient()
    await supabase.from('policies').delete().eq('id', id)
    toast.success(t.policies.deleted)
    loadPolicies()
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1"><a href="/onboarding" className="text-blue-500 hover:underline">{t.common.go_to_setup}</a></p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.policies.title}</h1>
          <Button onClick={openCreate} className="bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-lg shadow-sm h-9 px-4 text-sm"><Plus className="h-4 w-4 ml-1" />{t.policies.add_button}</Button>
        </div>
        <p className="text-gray-400 text-sm mt-1">{t.policies.subtitle}</p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? t.policies.dialog_edit : t.policies.dialog_new}</DialogTitle></DialogHeader>
            <div className="space-y-4 px-6 pb-6">
              <div className="space-y-2">
                <Label>{t.policies.label_type}</Label>
                <div className="flex flex-wrap gap-2">
                  {POLICY_TYPES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setType(p.value)}
                      className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                        type === p.value
                          ? 'border-[#2e90fa] bg-[#2e90fa]/5 text-[#2e90fa] font-medium shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:border-[#2e90fa]/30'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.policies.label_title}</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label>{t.policies.label_content}</Label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="rounded-xl" />
              </div>
              <Button onClick={save} className="w-full bg-[#2e90fa] border-0 rounded-xl h-11 shadow-md shadow-[#2e90fa]/25 hover:shadow-lg transition-all">{editing ? t.common.save : t.policies.add_button}</Button>
            </div>
          </DialogContent>
        </Dialog>

      {policies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/60 transition-all duration-200 hover:shadow-md">
          <div className="p-6 flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-blue-300 mb-3" />
            <p className="text-gray-500">{t.policies.empty}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {policies.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200/60 transition-all duration-200 hover:shadow-md">
              <div className="p-3 md:p-4 flex items-start justify-between gap-3">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}