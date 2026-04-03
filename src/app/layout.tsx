import type { Metadata } from "next"
import { Rubik } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
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
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-rubik)]">
        {children}
        <Toaster position="top-center" dir="rtl" />
      </body>
    </html>
  )
}
