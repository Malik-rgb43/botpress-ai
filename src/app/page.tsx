import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Mail, BarChart3, Shield, Zap, Users, Bot, ArrowLeft, Check, Sparkles } from "lucide-react"

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
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 text-center">
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

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />ללא כרטיס אשראי</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />התקנה ב-5 דקות</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />תמיכה בעברית</span>
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
            {
              icon: MessageSquare,
              title: "בוט וואטסאפ",
              description: "הבוט עונה ללקוחות בוואטסאפ באופן אוטומטי, מותאם לעסק שלך",
              gradient: "from-blue-500 to-blue-600"
            },
            {
              icon: Mail,
              title: "בוט אימייל",
              description: "תשובות אוטומטיות למיילים של לקוחות עם תוכן מותאם אישית",
              gradient: "from-indigo-500 to-indigo-600"
            },
            {
              icon: BarChart3,
              title: "דשבורד וניתוח",
              description: "ראה מה שואלים, כמה שיחות, שביעות רצון וסיכומים אוטומטיים",
              gradient: "from-violet-500 to-violet-600"
            },
            {
              icon: Shield,
              title: "מדיניות ו-FAQ",
              description: "הגדר שאלות נפוצות ומדיניות העסק והבוט ישתמש בהם לתשובות מדויקות",
              gradient: "from-blue-600 to-indigo-500"
            },
            {
              icon: Zap,
              title: "AI חכם ב-3 שכבות",
              description: "חיפוש FAQ, תשובה מבוססת AI, והעברה לנציג — הכל אוטומטי",
              gradient: "from-indigo-500 to-violet-500"
            },
            {
              icon: Users,
              title: "קל לכל בעל עסק",
              description: "אשף הגדרה פשוט צעד אחרי צעד, בלי צורך בידע טכני",
              gradient: "from-violet-500 to-blue-500"
            }
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
              { step: "01", title: "הירשם והגדר", description: "מלא את פרטי העסק, שאלות נפוצות ומדיניות דרך אשף פשוט", color: "text-blue-500" },
              { step: "02", title: "הבוט לומד", description: "ה-AI לומד את העסק שלך ומתחיל לענות על שאלות בצורה מותאמת", color: "text-indigo-500" },
              { step: "03", title: "חבר ערוצים", description: "חבר וואטסאפ ואימייל והבוט מתחיל לעבוד בשבילך 24/7", color: "text-violet-500" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className={`text-5xl font-bold ${item.color} opacity-30 mb-4`}>{item.step}</div>
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
            {
              name: 'חינם',
              price: '0',
              features: ['100 הודעות/חודש', 'ערוץ אחד', 'FAQ + AI בסיסי', 'דשבורד בסיסי'],
            },
            {
              name: 'בסיסי',
              price: '99',
              popular: true,
              features: ['1,000 הודעות/חודש', 'כל הערוצים', 'AI מתקדם + זיכרון', 'אנליטיקס מלא', 'סיכומים אוטומטיים'],
            },
            {
              name: 'פרימיום',
              price: '299',
              features: ['הודעות ללא הגבלה', 'כל הערוצים', 'White Label', 'תמיכה מועדפת', 'AI מתקדם + זיכרון'],
            },
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

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.03] -z-10" />
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">מוכן לתת ללקוחות שלך שירות 24/7?</h2>
          <p className="text-gray-500 text-lg mb-8">התחל בחינם, שדרג כשאתה מוכן</p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 py-6 gradient-primary border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
              התחל עכשיו בחינם
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <span>BotPress AI</span>
          </div>
          <p>© 2026 כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  )
}
