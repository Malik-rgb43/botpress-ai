import type { Metadata } from "next"
import { Rubik } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { LanguageProvider } from "@/i18n/provider"

const rubik = Rubik({
  subsets: ["latin", "hebrew", "arabic"],
  variable: "--font-rubik",
})

export const metadata: Metadata = {
  title: "BotPress AI - בוטים חכמים לעסקים",
  description: "צור בוטים חכמים לוואטסאפ ואימייל שעונים ללקוחות שלך בצורה מותאמת אישית",
  icons: {
    icon: "/images/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-rubik)]">
        <LanguageProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">דלג לתוכן</a>
          {children}
          <Toaster position="top-center" />
        </LanguageProvider>
      </body>
    </html>
  )
}
