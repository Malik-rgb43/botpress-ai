export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">מדיניות פרטיות</h1>
      <div className="prose prose-gray space-y-4 text-sm text-gray-600 leading-relaxed">
        <p><strong>עדכון אחרון:</strong> אפריל 2026</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6">1. מידע שאנחנו אוספים</h2>
        <p>BotPress AI אוספת מידע שאתה מספק לנו ישירות: שם העסק, כתובת אימייל, שאלות נפוצות, מדיניות העסק, והגדרות הבוט שלך.</p>
        <p>כאשר אתה מחבר את חשבון ה-Gmail שלך, אנחנו מקבלים גישה לקרוא ולשלוח אימיילים בשמך. אנחנו משתמשים בגישה זו אך ורק כדי לענות על פניות לקוחות.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6">2. שימוש במידע</h2>
        <p>אנחנו משתמשים במידע שלך כדי:</p>
        <ul className="list-disc mr-6 space-y-1">
          <li>להפעיל את בוט שירות הלקוחות שלך</li>
          <li>לענות על פניות לקוחות בשמך</li>
          <li>להציג לך אנליטיקס ודוחות</li>
          <li>לשפר את השירות שלנו</li>
        </ul>
        <h2 className="text-xl font-semibold text-gray-900 mt-6">3. שמירה על המידע</h2>
        <p>המידע שלך מאוחסן בשרתי Supabase (AWS) עם הצפנה. גישה למידע מוגבלת לחשבון שלך בלבד באמצעות Row Level Security.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6">4. שיתוף מידע</h2>
        <p>אנחנו לא מוכרים, משכירים או משתפים את המידע שלך עם צדדים שלישיים, למעט ספקי שירות נדרשים (Supabase, Google, Resend) שנחוצים להפעלת השירות.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6">5. זכויות המשתמש</h2>
        <p>אתה יכול לבקש למחוק את המידע שלך בכל עת דרך פנייה אלינו. ניתן לנתק את חשבון ה-Gmail בהגדרות האפליקציה.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6">6. יצירת קשר</h2>
        <p>לשאלות בנוגע למדיניות הפרטיות: orimalik19@gmail.com</p>
      </div>
    </div>
  )
}
