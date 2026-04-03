import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Mail, BarChart3, Shield, Zap, Users, Bot, ArrowLeft } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">BotPress AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3.5 py-1.5 text-sm text-gray-500 hover:text-black transition-colors rounded-lg hover:bg-gray-50">פיצ׳רים</a>
            <a href="#how" className="px-3.5 py-1.5 text-sm text-gray-500 hover:text-black transition-colors rounded-lg hover:bg-gray-50">איך זה עובד</a>
            <a href="#pricing" className="px-3.5 py-1.5 text-sm text-gray-500 hover:text-black transition-colors rounded-lg hover:bg-gray-50">תוכניות</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-black">התחברות</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-xl px-5 shadow-none">התחל בחינם</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-4 py-1.5 text-sm text-gray-600 mb-6">
          <Zap className="h-4 w-4" />
          <span>בוטים חכמים מבוססי AI לעסקים</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
          הלקוחות שלך מקבלים
          <br />
          <span className="text-gray-400">תשובות מיידיות, 24/7</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          צור בוט AI שמכיר את העסק שלך, עונה על שאלות לקוחות בוואטסאפ ובאימייל,
          ומעביר לנציג כשצריך. בלי קוד, בלי מתכנתים.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 py-6">
              צור בוט בחינם
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="text-base px-8 py-6">
              איך זה עובד?
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">הכל מה שהעסק שלך צריך</h2>
          <p className="text-gray-500 text-lg">מערכת אחת שמנהלת את כל התקשורת עם הלקוחות</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: MessageSquare,
              title: "בוט וואטסאפ",
              description: "הבוט עונה ללקוחות בוואטסאפ באופן אוטומטי, מותאם לעסק שלך"
            },
            {
              icon: Mail,
              title: "בוט אימייל",
              description: "תשובות אוטומטיות למיילים של לקוחות עם תוכן מותאם אישית"
            },
            {
              icon: BarChart3,
              title: "דשבורד וניתוח",
              description: "ראה מה שואלים, כמה שיחות, שביעות רצון וסיכומים אוטומטיים"
            },
            {
              icon: Shield,
              title: "מדיניות ו-FAQ",
              description: "הגדר שאלות נפוצות ומדיניות העסק והבוט ישתמש בהם לתשובות מדויקות"
            },
            {
              icon: Zap,
              title: "AI חכם ב-3 שכבות",
              description: "חיפוש FAQ, תשובה מבוססת AI, והעברה לנציג — הכל אוטומטי"
            },
            {
              icon: Users,
              title: "קל לכל בעל עסק",
              description: "אשף הגדרה פשוט צעד אחרי צעד, בלי צורך בידע טכני"
            }
          ].map((feature, i) => (
            <Card key={i} className="border border-gray-100 shadow-none hover:border-gray-200 transition-colors">
              <CardContent className="p-6">
                <feature.icon className="h-10 w-10 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">איך זה עובד?</h2>
            <p className="text-gray-500 text-lg">3 צעדים פשוטים ויש לך בוט חכם</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "הירשם והגדר", description: "מלא את פרטי העסק, שאלות נפוצות ומדיניות דרך אשף פשוט" },
              { step: "02", title: "הבוט לומד", description: "ה-AI לומד את העסק שלך ומתחיל לענות על שאלות בצורה מותאמת" },
              { step: "03", title: "חבר ערוצים", description: "חבר וואטסאפ ואימייל והבוט מתחיל לעבוד בשבילך 24/7" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-gray-200 mb-4">{item.step}</div>
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
            <Card key={i} className={`shadow-none relative ${plan.popular ? 'border-black border-2' : 'border-gray-100'}`}>
              {plan.popular && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-black text-white text-xs px-3 py-1 rounded-full">הכי פופולרי</span>
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price === '0' ? 'חינם' : `₪${plan.price}`}</span>
                  {plan.price !== '0' && <span className="text-gray-400 text-sm">/חודש</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    {plan.price === '0' ? 'התחל בחינם' : 'שדרג עכשיו'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">מוכן לתת ללקוחות שלך שירות 24/7?</h2>
        <p className="text-gray-500 text-lg mb-8">התחל בחינם, שדרג כשאתה מוכן</p>
        <Link href="/signup">
          <Button size="lg" className="text-base px-8 py-6">
            התחל עכשיו בחינם
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span>BotPress AI</span>
          </div>
          <p>© 2026 כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  )
}
