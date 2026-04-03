import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Mail, BarChart3, Shield, Zap, Users, Bot, ArrowLeft, Check, Sparkles, ChevronDown, Star, Globe, Clock } from "lucide-react"

function ProductMockup() {
  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-10 scale-105" />
      <div className="relative bg-white rounded-2xl border border-blue-100 shadow-2xl shadow-blue-500/10 overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-lg px-4 py-1 text-xs text-gray-400 border border-gray-100 w-64 text-center">botpress-ai.vercel.app/dashboard</div>
          </div>
        </div>
        {/* Dashboard content */}
        <div className="flex" dir="rtl">
          {/* Sidebar */}
          <div className="w-48 bg-white border-l border-gray-100 p-4 hidden md:block">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold">BotPress AI</span>
            </div>
            {['סקירה כללית', 'שאלות נפוצות', 'מדיניות', 'נסה את הבוט', 'אנליטיקס'].map((item, i) => (
              <div key={i} className={`text-[10px] px-2 py-1.5 rounded-md mb-0.5 ${i === 0 ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-400'}`}>
                {item}
              </div>
            ))}
          </div>
          {/* Main */}
          <div className="flex-1 p-6 bg-gray-50/50">
            <p className="text-sm font-bold mb-4">שלום, חנות הפרחים של דנה 👋</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'שיחות', value: '247', color: 'from-blue-500 to-blue-600' },
                { label: 'שאלות נפוצות', value: '18', color: 'from-indigo-500 to-indigo-600' },
                { label: 'שביעות רצון', value: '4.8', color: 'from-violet-500 to-violet-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-[9px] text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold gradient-text">{stat.value}</p>
                </div>
              ))}
            </div>
            {/* Chat preview */}
            <div className="bg-white rounded-lg border border-gray-100 p-3">
              <p className="text-[9px] font-medium text-gray-500 mb-2">שיחה אחרונה</p>
              <div className="space-y-2">
                <div className="flex justify-start">
                  <div className="gradient-primary text-white text-[10px] px-3 py-1.5 rounded-xl rounded-tr-sm max-w-[70%]">מה שעות הפעילות?</div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-gray-100 text-[10px] px-3 py-1.5 rounded-xl rounded-tl-sm max-w-[70%]">אנחנו פתוחים א׳-ה׳ 9:00-18:00, שישי 9:00-13:00</div>
                </div>
                <div className="flex justify-start">
                  <div className="gradient-primary text-white text-[10px] px-3 py-1.5 rounded-xl rounded-tr-sm max-w-[70%]">תודה! ומה לגבי משלוחים?</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-blue-100/60 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-blue-50/30 transition-colors">
        <span className="font-medium text-gray-900">{q}</span>
        <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform" />
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
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-6 pt-32 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-600 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>בוטים חכמים מבוססי AI לעסקים</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            הלקוחות שלך מקבלים
            <br />
            <span className="gradient-text">תשובות מיידיות, 24/7</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            צור בוט AI שמכיר את העסק שלך, עונה על שאלות לקוחות בוואטסאפ ובאימייל,
            ומעביר לנציג כשצריך. בלי קוד, בלי מתכנתים.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 py-6 gradient-primary border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                צור בוט בחינם
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-base px-8 py-6 border-blue-200 text-blue-600 hover:bg-blue-50">
                איך זה עובד?
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-10 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />ללא כרטיס אשראי</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />התקנה ב-5 דקות</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />תמיכה בעברית</span>
          </div>
        </div>
      </section>

      {/* Product Mockup */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <ProductMockup />
      </section>

      {/* Social Proof Stats */}
      <section className="border-y border-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'עסקים פעילים', icon: Users },
              { value: '50K+', label: 'הודעות בחודש', icon: MessageSquare },
              { value: '4.9', label: 'שביעות רצון', icon: Star },
              { value: '24/7', label: 'זמינות הבוט', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <stat.icon className="h-5 w-5 text-blue-400 mb-2" />
                <div className="text-2xl font-bold gradient-text mb-1">{stat.value}</div>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">הכל מה שהעסק שלך צריך</h2>
          <p className="text-gray-500 text-lg">מערכת אחת שמנהלת את כל התקשורת עם הלקוחות</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: MessageSquare, title: "בוט וואטסאפ", description: "הבוט עונה ללקוחות בוואטסאפ באופן אוטומטי, מותאם לעסק שלך", gradient: "from-blue-500 to-blue-600" },
            { icon: Mail, title: "בוט אימייל", description: "תשובות אוטומטיות למיילים של לקוחות עם תוכן מותאם אישית", gradient: "from-indigo-500 to-indigo-600" },
            { icon: BarChart3, title: "דשבורד וניתוח", description: "ראה מה שואלים, כמה שיחות, שביעות רצון וסיכומים אוטומטיים", gradient: "from-violet-500 to-violet-600" },
            { icon: Shield, title: "מדיניות ו-FAQ", description: "הגדר שאלות נפוצות ומדיניות העסק והבוט ישתמש בהם לתשובות מדויקות", gradient: "from-blue-600 to-indigo-500" },
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">איך זה עובד?</h2>
            <p className="text-gray-500 text-lg">3 צעדים פשוטים ויש לך בוט חכם</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "הירשם והגדר", description: "מלא את פרטי העסק, שאלות נפוצות ומדיניות דרך אשף פשוט", color: "from-blue-500 to-blue-600" },
              { step: "02", title: "הבוט לומד", description: "ה-AI לומד את העסק שלך ומתחיל לענות על שאלות בצורה מותאמת", color: "from-indigo-500 to-indigo-600" },
              { step: "03", title: "חבר ערוצים", description: "חבר וואטסאפ ואימייל והבוט מתחיל לעבוד בשבילך 24/7", color: "from-violet-500 to-violet-600" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20`}>
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">תוכניות ומחירים</h2>
          <p className="text-gray-500 text-lg">התחל בחינם, שדרג כשהעסק גדל</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'חינם', price: '0', features: ['100 הודעות/חודש', 'ערוץ אחד', 'FAQ + AI בסיסי', 'דשבורד בסיסי'] },
            { name: 'בסיסי', price: '99', popular: true, features: ['1,000 הודעות/חודש', 'כל הערוצים', 'AI מתקדם + זיכרון', 'אנליטיקס מלא', 'סיכומים אוטומטיים'] },
            { name: 'פרימיום', price: '299', features: ['הודעות ללא הגבלה', 'כל הערוצים', 'White Label', 'תמיכה מועדפת', 'AI מתקדם + זיכרון'] },
          ].map((plan, i) => (
            <Card key={i} className={`shadow-none relative transition-all duration-300 hover:shadow-lg ${plan.popular ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 scale-[1.02]' : 'border-gray-100 hover:border-blue-200 hover:shadow-blue-500/5'}`}>
              {plan.popular && (
                <div className="absolute -top-3 right-4">
                  <span className="gradient-primary text-white text-xs px-3 py-1 rounded-full shadow-md shadow-blue-500/25">הכי פופולרי</span>
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.popular ? 'gradient-text' : ''}`}>{plan.price === '0' ? 'חינם' : `₪${plan.price}`}</span>
                  {plan.price !== '0' && <span className="text-gray-400 text-sm">/חודש</span>}
                </div>
                <ul className="space-y-2 mb-6">
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
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary-soft -z-10" />
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">שאלות נפוצות</h2>
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
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="relative rounded-3xl overflow-hidden p-12 md:p-16">
          <div className="absolute inset-0 gradient-primary opacity-[0.06] -z-10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl -z-10" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">מוכן לתת ללקוחות שלך שירות 24/7?</h2>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">הצטרף ל-500+ עסקים שכבר משתמשים ב-BotPress AI וחוסכים שעות של עבודה כל יום</p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-10 py-6 gradient-primary border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
              התחל עכשיו בחינם
              <ArrowLeft className="h-4 w-4 mr-2" />
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
                <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
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
