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
import { motion, AnimatePresence } from 'framer-motion'
import type { Policy } from '@/types/database'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  exit: { opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25, ease: 'easeInOut' as const } },
}

const policyTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  returns: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100/80' },
  shipping: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100/80' },
  hours: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100/80' },
  payment: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100/80' },
  custom: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200/80' },
}

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
      const { error } = await supabase.from('policies').update({ type, title, content }).eq('id', editing.id)
      if (error) { toast.error(t.common.error); return }
      toast.success(t.policies.updated)
    } else {
      const { error } = await supabase.from('policies').insert({ business_id: business!.id, type, title, content })
      if (error) { toast.error(t.common.error); return }
      toast.success(t.policies.added)
    }
    setDialogOpen(false)
    loadPolicies()
  }

  async function remove(id: string) {
    if (!confirm('למחוק את המדיניות?')) return
    const supabase = createClient()
    const { error } = await supabase.from('policies').delete().eq('id', id)
    if (error) { toast.error(t.common.error); return }
    toast.success(t.policies.deleted)
    loadPolicies()
  }

  if (bizLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!business) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center h-64 text-center"
      >
        <FileText className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1">
          <a href="/onboarding" className="text-blue-500 hover:underline">{t.common.go_to_setup}</a>
        </p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.policies.title}</h1>
            <p className="text-gray-400 text-sm mt-1">{t.policies.subtitle}</p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 h-9 px-4 text-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4 ml-1" />
            {t.policies.add_button}
          </Button>
        </div>
      </motion.div>

      {/* Add/Edit Policy Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t.policies.dialog_edit : t.policies.dialog_new}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-6 pb-6">
            <div className="space-y-2">
              <Label>{t.policies.label_type}</Label>
              <div className="flex flex-wrap gap-2">
                {POLICY_TYPES.map(p => {
                  const colors = policyTypeColors[p.value] || policyTypeColors.custom
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setType(p.value)}
                      className={`px-3 py-2 rounded-full text-sm border transition-all duration-200 ${
                        type === p.value
                          ? `${colors.bg} ${colors.text} ${colors.border} font-medium shadow-sm`
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
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
            <Button
              onClick={save}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 border-0 rounded-xl h-11 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
            >
              {editing ? t.common.save : t.policies.add_button}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Policies List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      ) : policies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-2xl border border-gray-200/60 bg-white shadow-sm"
        >
          <div className="p-6 flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-blue-300 mb-3" />
            <p className="text-gray-500">{t.policies.empty}</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {policies.map((p) => {
              const colors = policyTypeColors[p.type] || policyTypeColors.custom
              return (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25, ease: 'easeInOut' } }}
                  layout
                  className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-200"
                >
                  <div className="p-3 md:p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs ${colors.bg} ${colors.text} px-2.5 py-0.5 rounded-full mb-1.5 inline-block font-medium border ${colors.border}`}>
                        {POLICY_TYPES.find(pt => pt.value === p.type)?.label || p.type}
                      </span>
                      <p className="font-medium text-sm text-gray-900">{p.title}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{p.content}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors duration-150"
                        onClick={() => remove(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
