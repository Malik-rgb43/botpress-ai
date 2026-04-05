'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, Loader2, HelpCircle, Globe, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/provider'
import type { FAQ } from '@/types/database'

interface GeneratedFaq {
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const { t, lang } = useTranslation()
  const { business, loading: bizLoading } = useBusiness()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('')

  // Website generation state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFaqs, setGeneratedFaqs] = useState<GeneratedFaq[]>([])
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [isSavingGenerated, setIsSavingGenerated] = useState(false)

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

  // Website FAQ generation
  async function generateFromWebsite() {
    if (!websiteUrl.trim()) return

    // Validate URL
    try {
      new URL(websiteUrl)
    } catch {
      toast.error(t.faq.invalid_url)
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: websiteUrl,
          businessName: business?.name,
          language: lang,
          businessId: business?.id,
        }),
      })

      const data = await res.json()

      if (res.status === 429) {
        toast.error(t.faq.limit_reached)
        setIsGenerating(false)
        return
      }

      if (!res.ok || !data.faqs?.length) {
        toast.error(t.faq.no_results)
        setIsGenerating(false)
        return
      }

      setGeneratedFaqs(data.faqs)
      setSelectedIndexes(new Set(data.faqs.map((_: unknown, i: number) => i)))
      setShowPreview(true)
    } catch {
      toast.error(t.faq.scrape_error)
    }
    setIsGenerating(false)
  }

  function toggleSelect(index: number) {
    setSelectedIndexes(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIndexes.size === generatedFaqs.length) {
      setSelectedIndexes(new Set())
    } else {
      setSelectedIndexes(new Set(generatedFaqs.map((_, i) => i)))
    }
  }

  async function addSelectedFaqs() {
    const selected = generatedFaqs.filter((_, i) => selectedIndexes.has(i))
    if (selected.length === 0) return

    setIsSavingGenerated(true)
    const supabase = createClient()
    const inserts = selected.map((faq, i) => ({
      business_id: business!.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || null,
      order: faqs.length + i,
    }))

    const { error } = await supabase.from('faqs').insert(inserts)
    if (error) {
      toast.error(t.common.error_loading)
    } else {
      toast.success(`${selected.length} ${t.faq.added_count}`)
      setShowPreview(false)
      setGeneratedFaqs([])
      setWebsiteUrl('')
      loadFaqs()
    }
    setIsSavingGenerated(false)
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

      {/* Website URL Generation Bar */}
      <div className="bg-white rounded-xl border border-gray-200/60 p-3 mb-4 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Globe className="absolute top-1/2 -translate-y-1/2 right-3 h-4 w-4 text-gray-300 pointer-events-none" />
          <Input
            type="url"
            dir="ltr"
            placeholder={t.faq.url_placeholder}
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="h-10 pr-10 rounded-lg border-gray-200 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && generateFromWebsite()}
          />
        </div>
        <Button
          onClick={generateFromWebsite}
          disabled={isGenerating || !websiteUrl.trim()}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 rounded-lg shadow-sm h-10 px-5 text-sm shrink-0"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-1.5" />
              {t.faq.generating}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 ml-1.5" />
              {t.faq.generate_from_website}
            </>
          )}
        </Button>
      </div>

      {/* Add/Edit FAQ Dialog */}
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

      {/* Preview Generated FAQs Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t.faq.preview_title}</DialogTitle>
            <p className="text-sm text-gray-400 mt-1">{t.faq.preview_subtitle}</p>
          </DialogHeader>
          <div className="px-6 pb-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                selectedIndexes.size === generatedFaqs.length
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedIndexes.size === generatedFaqs.length && <Check className="h-3 w-3 text-white" />}
              </div>
              {t.faq.select_all} ({selectedIndexes.size}/{generatedFaqs.length})
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-6 space-y-2 pb-4">
            {generatedFaqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => toggleSelect(i)}
                className={`w-full text-right rounded-xl border p-3 transition-all duration-200 ${
                  selectedIndexes.has(i)
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-gray-200/60 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selectedIndexes.has(i)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedIndexes.has(i) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {faq.category && (
                      <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mb-1 inline-block">{faq.category}</span>
                    )}
                    <p className="text-sm font-medium text-gray-900">{faq.question}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{faq.answer}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="px-6 pb-6 pt-2 border-t border-gray-100">
            <Button
              onClick={addSelectedFaqs}
              disabled={selectedIndexes.size === 0 || isSavingGenerated}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-xl h-11 shadow-sm"
            >
              {isSavingGenerated ? (
                <Loader2 className="h-4 w-4 animate-spin ml-1.5" />
              ) : (
                <Plus className="h-4 w-4 ml-1.5" />
              )}
              {t.faq.add_selected} ({selectedIndexes.size})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/60 transition-all duration-200">
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
