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
  metadataBase: new URL('https://botpress-ai.vercel.app'),
  title: "BotPress AI - בוט AI חכם לשירות לקוחות | וואטסאפ, אימייל וצ׳אט",
  description: "צור בוט AI שסורק את האתר שלך, לומד את העסק, ועונה ללקוחות 24/7 בוואטסאפ, אימייל ובאתר. הקמה ב-3 דקות, בלי קוד.",
  keywords: ["בוט AI", "שירות לקוחות", "וואטסאפ", "צ׳אטבוט", "בוט לעסקים", "AI chatbot", "customer service bot"],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "BotPress AI - בוט AI חכם לשירות לקוחות",
    description: "הבוט שסורק את האתר שלך ועונה ללקוחות 24/7. וואטסאפ, אימייל וצ׳אט — ממקום אחד.",
    url: "https://botpress-ai.vercel.app",
    siteName: "BotPress AI",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "BotPress AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BotPress AI - בוט AI חכם לשירות לקוחות",
    description: "הבוט שסורק את האתר שלך ועונה ללקוחות 24/7",
  },
  robots: {
    index: true,
    follow: true,
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
