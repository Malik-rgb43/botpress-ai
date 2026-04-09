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
import { motion, AnimatePresence } from 'framer-motion'
import type { FAQ } from '@/types/database'

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
    if (!confirm('למחוק את השאלה?')) return
    const supabase = createClient()
    const { error } = await supabase.from('faqs').delete().eq('id', id)
    if (error) { toast.error(t.common.error); return }
    toast.success(t.faq.deleted)
    loadFaqs()
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
        <HelpCircle className="h-10 w-10 text-blue-300 mb-3" />
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.faq.title}</h1>
            <p className="text-gray-400 text-sm mt-1">{t.faq.subtitle}</p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 h-9 px-4 text-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4 ml-1" />
            {t.faq.add_button}
          </Button>
        </div>
      </motion.div>

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
            <Button
              onClick={saveFaq}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 border-0 rounded-xl h-11 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
            >
              {t.common.save}
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-2xl border border-gray-200/60 bg-white shadow-sm"
        >
          <div className="p-6 flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="h-10 w-10 text-blue-300 mb-3" />
            <p className="text-gray-500">{t.faq.empty_title}</p>
            <p className="text-gray-400 text-sm">{t.faq.empty_subtitle}</p>
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
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                variants={itemVariants}
                exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25, ease: 'easeInOut' } }}
                layout
                className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-200"
              >
                <div className="p-3 md:p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {faq.category && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full mb-1.5 inline-block font-medium border border-blue-100/80">
                        {faq.category}
                      </span>
                    )}
                    <p className="font-medium text-sm text-gray-900">{faq.question}</p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{faq.answer}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                      onClick={() => openEdit(faq)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors duration-150"
                      onClick={() => deleteFaq(faq.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
