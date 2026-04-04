'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, Loader2, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { FAQ } from '@/types/database'

export default function FAQPage() {
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
      if (error) { toast.error('שגיאה בעדכון'); return }
      toast.success('השאלה עודכנה')
    } else {
      const { error } = await supabase.from('faqs').insert({
        business_id: business!.id,
        question,
        answer,
        category: category || null,
        order: faqs.length,
      })
      if (error) { toast.error('שגיאה בהוספה'); return }
      toast.success('השאלה נוספה')
    }

    setDialogOpen(false)
    loadFaqs()
  }

  async function deleteFaq(id: string) {
    const supabase = createClient()
    await supabase.from('faqs').delete().eq('id', id)
    toast.success('השאלה נמחקה')
    loadFaqs()
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <HelpCircle className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">צריך ליצור עסק קודם</p>
        <p className="text-gray-400 text-sm mt-1">עבור ל<a href="/onboarding" className="text-blue-500 hover:underline">הגדרת העסק</a></p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">שאלות נפוצות</h1>
          <p className="text-gray-500 text-sm mt-1">שאלות ותשובות שהבוט משתמש בהן</p>
        </div>
        <Button onClick={openCreate} className="gradient-primary border-0 shadow-md shadow-blue-500/25">
          <Plus className="h-4 w-4 ml-1" />
          הוסף שאלה
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'ערוך שאלה' : 'שאלה חדשה'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>קטגוריה</Label>
                <Input placeholder="למשל: משלוחים" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>שאלה *</Label>
                <Input placeholder="מה השאלה?" value={question} onChange={(e) => setQuestion(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>תשובה *</Label>
                <Textarea placeholder="התשובה..." value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} />
              </div>
              <Button onClick={saveFaq} className="w-full gradient-primary border-0">{editingFaq ? 'עדכן' : 'הוסף'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {faqs.length === 0 ? (
        <Card className="border-blue-100/60 shadow-none hover:shadow-md hover:shadow-blue-500/5 transition-all">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="h-10 w-10 text-blue-300 mb-3" />
            <p className="text-gray-500">עדיין אין שאלות נפוצות</p>
            <p className="text-gray-400 text-sm">הוסף שאלות כדי שהבוט ידע לענות עליהן</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map(faq => (
            <Card key={faq.id} className="border-blue-100/60 shadow-none hover:shadow-md hover:shadow-blue-500/5 transition-all">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {faq.category && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-1 inline-block">{faq.category}</span>
                  )}
                  <p className="font-medium text-sm">{faq.question}</p>
                  <p className="text-sm text-gray-500 mt-1">{faq.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(faq)}>
                    <Pencil className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteFaq(faq.id)}>
                    <Trash2 className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}