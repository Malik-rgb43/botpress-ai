import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Mail, BarChart3, Shield, Zap, Users, Bot, ArrowLeft } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-black" />
            <span className="text-xl font-bold">BotPress AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">התחברות</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">התחל בחינם</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
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
      <section className="bg-gray-50 py-24">
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
