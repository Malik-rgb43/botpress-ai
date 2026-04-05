'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations, languages } from './index'
import type { Translations, Language } from './index'

interface LanguageContextType {
  lang: Language
  t: Translations
  dir: 'rtl' | 'ltr'
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'he',
  t: translations.he,
  dir: 'rtl',
  setLanguage: () => {},
})

const STORAGE_KEY = 'botpress-ai-lang'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('he')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null
    if (saved && translations[saved]) {
      setLang(saved)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = languages[lang].dir
  }, [lang])

  const setLanguage = useCallback((newLang: Language) => {
    setLang(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)
  }, [])

  const value: LanguageContextType = {
    lang,
    t: translations[lang],
    dir: languages[lang].dir,
    setLanguage,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
