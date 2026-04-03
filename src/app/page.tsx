import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Mail, BarChart3, Shield, Zap, Users, Bot, ArrowLeft, Check, Sparkles, ChevronDown, Star, Clock, Globe, Play, Quote } from "lucide-react"

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-blue-100/60 rounded-xl overflow-hidden bg-white">
      <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-blue-50/30 transition-colors">
        <span className="font-medium text-gray-900">{q}</span>
        <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0 mr-3" />
      </summary>
      <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{a}</div>
    </details>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="glass border border-blue-100/60 rounded-2xl shadow-[0_2px_20px_rgba(59,130,246,0.1)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo.png" alt="BotPress AI" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">BotPress AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3.5 py-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50/50">פיצ׳רים</a>
            <a href="#how" className="px-3.5 py-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50/50">איך זה עובד</a>
            <a href="#pricing" className="px-3.5 py-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50/50">תוכניות</a>
            <a href="#faq" className="px-3.5 py-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50/50">שאלות</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">התחברות</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-xl px-5 gradient-primary border-0 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all">התחל בחינם</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-6 pt-32 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-600 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>הפלטפורמה #1 לבוטים חכמים לעסקים</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            בוט AI שעונה
            <br />
            <span className="gradient-text">ללקוחות שלך 24/7</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            צור בוט בדקות, חבר לוואטסאפ ואימייל, והבוט עונה בשמך —
            מותאם אישית לעסק שלך, בלי שורת קוד אחת.
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link href="/signup">
              <Button size="lg" className="text-base px-10 py-7 gradient-primary border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-lg">
                צור בוט בחינם
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Button>
            </Link>
            <Link href="#how">
              <Button variant="outline" size="lg" className="text-base px-8 py-7 border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                <Play className="h-4 w-4" />
                ראה איך זה עובד
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />ללא כרטיס אשראי</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />התקנה ב-5 דקות</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />תמיכה מלאה בעברית</span>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative">
          <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-10 scale-105" />
          <div className="relative rounded-2xl overflow-hidden border border-blue-100 shadow-2xl shadow-blue-500/10 glow">
            <Image src="/images/hero.png" alt="BotPress AI Dashboard" width={1280} height={720} className="w-full h-auto" priority />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-blue-50 py-14 bg-gradient-to-r from-blue-50/30 via-white to-indigo-50/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'עסקים משתמשים', icon: Users },
              { value: '50K+', label: 'הודעות בחודש', icon: MessageSquare },
              { value: '4.9/5', label: 'שביעות רצון ממוצעת', icon: Star },
              { value: '<2 דק׳', label: 'זמן תגובה ממוצע', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <stat.icon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-extrabold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-600 mb-4">
            <Zap className="h-4 w-4" />
            פיצ׳רים
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">הכל מה שהעסק שלך צריך</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">מערכת אחת שמנהלת את כל התקשורת עם הלקוחות — אוטומטית, חכם, מותאם</p>
        </div>

        {/* Feature highlight with image */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 md:order-1">
            <div className="relative rounded-2xl overflow-hidden border border-blue-100 shadow-xl shadow-blue-500/5">
              <Image src="/images/feature.png" alt="WhatsApp Bot" width={896} height={1120} className="w-full h-auto" />
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">בוט שמדבר כמוך</h3>
            <p className="text-gray-500 leading-relaxed">
              הבוט לומד את הטון, המדיניות והשאלות הנפוצות של העסק שלך. כשלקוח שואל שאלה בוואטסאפ — הבוט עונה בדיוק כמו שאתה היית עונה.
            </p>
            <ul className="space-y-3">
              {['תשובות מותאמות אישית לעסק', 'זיהוי שפה אוטומטי', 'העברה לנציג כשצריך', 'זיכרון שיחות ללקוחות חוזרים'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <Button className="gradient-primary border-0 shadow-md shadow-blue-500/25 mt-2">
                נסה בחינם
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: MessageSquare, title: "בוט וואטסאפ", description: "הבוט עונה ללקוחות בוואטסאפ באופן אוטומטי, מותאם לעסק שלך", gradient: "from-blue-500 to-blue-600" },
            { icon: Mail, title: "בוט אימייל", description: "תשובות אוטומטיות למיילים של לקוחות עם תוכן מותאם אישית", gradient: "from-indigo-500 to-indigo-600" },
            { icon: BarChart3, title: "דשבורד וניתוח", description: "ראה מה שואלים, כמה שיחות, שביעות רצון וסיכומים אוטומטיים", gradient: "from-violet-500 to-violet-600" },
            { icon: Shield, title: "מדיניות ו-FAQ", description: "הגדר שאלות נפוצות ומדיניות העסק והבוט ישתמש בהם לתשובות", gradient: "from-blue-600 to-indigo-500" },
            { icon: Zap, title: "AI חכם ב-3 שכבות", description: "חיפוש FAQ, תשובה מבוססת AI, והעברה לנציג — הכל אוטומטי", gradient: "from-indigo-500 to-violet-500" },
            { icon: Globe, title: "רב-שפתי", description: "הבוט מזהה את השפה ועונה בעברית, אנגלית וערבית אוטומטית", gradient: "from-violet-500 to-blue-500" },
          ].map((feature, i) => (
            <Card key={i} className="group border border-gray-100 shadow-none hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary-soft -z-10" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">איך זה עובד?</h2>
            <p className="text-gray-500 text-lg">3 צעדים פשוטים ויש לך בוט חכם שעובד בשבילך</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "הירשם והגדר", description: "מלא את פרטי העסק, שאלות נפוצות ומדיניות דרך אשף פשוט. ה-AI יכול גם ליצור FAQ אוטומטית מהאתר שלך.", color: "from-blue-500 to-blue-600" },
              { step: "02", title: "הבוט לומד", description: "ה-AI לומד את העסק שלך — את הטון, המדיניות, והתשובות. תוך דקות הוא מוכן לענות.", color: "from-indigo-500 to-indigo-600" },
              { step: "03", title: "חבר ערוצים", description: "חבר וואטסאפ, אימייל, או שים צ׳אט באתר. הבוט מתחיל לעבוד 24/7.", color: "from-violet-500 to-violet-600" }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-blue-100/60 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20`}>
                  <span className="text-lg font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">מה אומרים הלקוחות</h2>
          <p className="text-gray-500 text-lg">עסקים שכבר משתמשים ב-BotPress AI</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'דנה כהן', role: 'חנות פרחים', text: 'הבוט חסך לי שעות ביום. לקוחות מקבלים תשובות מיידיות על משלוחים ושעות פעילות, ואני יכולה להתמקד בעבודה.', stars: 5 },
            { name: 'יוסי לוי', role: 'מסעדה', text: 'מאז שחיברנו את הבוט, 80% מהשאלות נענות אוטומטית. צמצמנו את הצורך בנציג טלפוני.', stars: 5 },
            { name: 'מיכל אברהם', role: 'חנות אונליין', text: 'ההגדרה הייתה קלה מאוד. תוך 10 דקות היה לי בוט שעונה על שאלות לגבי החזרות ומשלוחים.', stars: 5 },
          ].map((t, i) => (
            <Card key={i} className="border-blue-100/60 shadow-none hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-blue-200 mb-2" />
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="border-t border-blue-50 pt-4">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary-soft -z-10" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">תוכניות ומחירים</h2>
            <p className="text-gray-500 text-lg">התחל בחינם, שדרג כשהעסק גדל</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'חינם', price: '0', features: ['100 הודעות/חודש', 'ערוץ אחד', 'FAQ + AI בסיסי', 'דשבורד בסיסי'] },
              { name: 'בסיסי', price: '99', popular: true, features: ['1,000 הודעות/חודש', 'כל הערוצים', 'AI מתקדם + זיכרון', 'אנליטיקס מלא', 'סיכומים אוטומטיים'] },
              { name: 'פרימיום', price: '299', features: ['הודעות ללא הגבלה', 'כל הערוצים', 'White Label', 'תמיכה מועדפת', 'AI מתקדם + זיכרון'] },
            ].map((plan, i) => (
              <Card key={i} className={`shadow-none relative transition-all duration-300 hover:shadow-lg bg-white ${plan.popular ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 scale-[1.02]' : 'border-gray-100 hover:border-blue-200 hover:shadow-blue-500/5'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 right-4">
                    <span className="gradient-primary text-white text-xs px-3 py-1 rounded-full shadow-md shadow-blue-500/25">הכי פופולרי</span>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-extrabold ${plan.popular ? 'gradient-text' : ''}`}>{plan.price === '0' ? 'חינם' : `₪${plan.price}`}</span>
                    {plan.price !== '0' && <span className="text-gray-400 text-sm">/חודש</span>}
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-blue-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className={`w-full ${plan.popular ? 'gradient-primary border-0 shadow-md shadow-blue-500/25' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      {plan.price === '0' ? 'התחל בחינם' : 'שדרג עכשיו'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">שאלות נפוצות</h2>
          <p className="text-gray-500 text-lg">תשובות לשאלות שנשאלות הכי הרבה</p>
        </div>
        <div className="space-y-3">
          <FAQItem q="האם צריך ידע טכני כדי להשתמש?" a="בכלל לא! המערכת בנויה לבעלי עסקים ללא רקע טכני. אשף ההגדרה מנחה אותך צעד אחרי צעד, ותוך 5 דקות הבוט שלך מוכן." />
          <FAQItem q="איך הבוט יודע לענות על שאלות?" a="הבוט משתמש ב-3 שכבות: קודם מחפש בשאלות הנפוצות שהגדרת, אחר כך משתמש ב-AI עם כל המידע על העסק שלך, ואם עדיין לא מצליח — מעביר לנציג אנושי." />
          <FAQItem q="אפשר לבדוק לפני שמחברים לוואטסאפ?" a="בהחלט! יש סימולטור מובנה שמאפשר לך לשלוח הודעות לבוט ולראות בדיוק איך הוא עונה, כולל מאיזו שכבה הגיעה התשובה." />
          <FAQItem q="כמה עולה?" a="יש תוכנית חינמית עם 100 הודעות בחודש, מספיק כדי להתחיל ולבדוק. תוכניות משודרגות מתחילות מ-99₪ לחודש." />
          <FAQItem q="באילו שפות הבוט תומך?" a="הבוט מזהה אוטומטית את שפת הלקוח ועונה באותה שפה. כרגע תומך בעברית, אנגלית וערבית." />
          <FAQItem q="מה קורה כשהבוט לא יודע לענות?" a="הבוט מעביר את השיחה לנציג אנושי ומודיע לך בזמן אמת. אתה יכול לענות ישירות מהדשבורד." />
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center">
          <div className="absolute inset-0 gradient-primary -z-10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-[5]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-[5]" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">מוכן לתת ללקוחות שלך שירות 24/7?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">הצטרף ל-500+ עסקים שכבר חוסכים שעות כל יום עם BotPress AI</p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-10 py-7 bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-lg text-lg font-semibold">
              התחל עכשיו בחינם
              <ArrowLeft className="h-5 w-5 mr-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/images/logo.png" alt="BotPress AI" width={28} height={28} className="rounded-md" />
                <span className="font-bold">BotPress AI</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">בוטים חכמים מבוססי AI לעסקים. תשובות מיידיות, 24/7.</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">מוצר</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-blue-500 transition-colors">פיצ׳רים</a></li>
                <li><a href="#pricing" className="hover:text-blue-500 transition-colors">מחירים</a></li>
                <li><a href="#faq" className="hover:text-blue-500 transition-colors">שאלות נפוצות</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">חברה</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="hover:text-blue-500 transition-colors cursor-pointer">אודות</span></li>
                <li><span className="hover:text-blue-500 transition-colors cursor-pointer">בלוג</span></li>
                <li><span className="hover:text-blue-500 transition-colors cursor-pointer">צור קשר</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">משפטי</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="hover:text-blue-500 transition-colors cursor-pointer">תנאי שימוש</span></li>
                <li><span className="hover:text-blue-500 transition-colors cursor-pointer">פרטיות</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-50 pt-6 text-center text-sm text-gray-400">
            © 2026 BotPress AI. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  )
}
