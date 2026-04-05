'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, Loader2, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/provider'
import type { FAQ } from '@/types/database'

export default function FAQPage() {
  const { t } = useTranslation()
  const { business, loading: bizLoading } = useBusiness()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (!business) return
    loadFaqs()
  }, [business])

  async function loadFaqs() {
    const supabase = createClient()
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .eq('business_id', business!.id)
      .order('order', { ascending: true })
    setFaqs(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditingFaq(null)
    setQuestion('')
    setAnswer('')
    setCategory('')
    setDialogOpen(true)
  }

  function openEdit(faq: FAQ) {
    setEditingFaq(faq)
    setQuestion(faq.question)
    setAnswer(faq.answer)
    setCategory(faq.category || '')
    setDialogOpen(true)
  }

  async function saveFaq() {
    if (!question.trim() || !answer.trim()) return
    const supabase = createClient()

    if (editingFaq) {
      const { error } = await supabase
        .from('faqs')
        .update({ question, answer, category: category || null })
        .eq('id', editingFaq.id)
      if (error) { toast.error(t.common.error_loading); return }
      toast.success(t.faq.updated)
    } else {
      const { error } = await supabase.from('faqs').insert({
        business_id: business!.id,
        question,
        answer,
        category: category || null,
        order: faqs.length,
      })
      if (error) { toast.error(t.common.error_loading); return }
      toast.success(t.faq.added)
    }

    setDialogOpen(false)
    loadFaqs()
  }

  async function deleteFaq(id: string) {
    const supabase = createClient()
    await supabase.from('faqs').delete().eq('id', id)
    toast.success(t.faq.deleted)
    loadFaqs()
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <HelpCircle className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1"><a href="/onboarding" className="text-blue-500 hover:underline">{t.common.go_to_setup}</a></p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.faq.title}</h1>
          <Button onClick={openCreate} className="bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-lg shadow-sm h-9 px-4 text-sm">
            <Plus className="h-4 w-4 ml-1" />
            {t.faq.add_button}
          </Button>
        </div>
        <p className="text-gray-400 text-sm mt-1">{t.faq.subtitle}</p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFaq ? t.faq.dialog_edit : t.faq.dialog_new}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 px-6 pb-6">
              <div className="space-y-2">
                <Label>{t.faq.label_category}</Label>
                <Input placeholder={t.faq.placeholder_category} value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label>{t.faq.label_question}</Label>
                <Input placeholder={t.faq.placeholder_question} value={question} onChange={(e) => setQuestion(e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label>{t.faq.label_answer}</Label>
                <Textarea placeholder={t.faq.placeholder_answer} value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} className="rounded-xl" />
              </div>
              <Button onClick={saveFaq} className="w-full bg-[#2e90fa] border-0 rounded-xl h-11 shadow-md shadow-[#2e90fa]/25 hover:shadow-lg transition-all">{t.common.save}</Button>
            </div>
          </DialogContent>
        </Dialog>

      {faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/60 transition-all duration-200 hover:shadow-md">
          <div className="p-6 flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="h-10 w-10 text-blue-300 mb-3" />
            <p className="text-gray-500">{t.faq.empty_title}</p>
            <p className="text-gray-400 text-sm">{t.faq.empty_subtitle}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={faq.id} className={`bg-white rounded-xl border border-gray-200/60 transition-all duration-200 hover:shadow-md ${index % 2 === 0 ? '' : 'bg-blue-50/30'}`}>
              <div className="p-3 md:p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {faq.category && (
                    <span className="text-xs bg-blue-100/80 text-blue-700 px-2.5 py-0.5 rounded-full mb-1.5 inline-block font-medium">{faq.category}</span>
                  )}
                  <p className="font-medium text-sm">{faq.question}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{faq.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600" onClick={() => openEdit(faq)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-500" onClick={() => deleteFaq(faq.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}