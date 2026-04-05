import he from './he'
import en from './en'
import ar from './ar'
import type { Translations } from './he'

export type { Translations }
export type Language = 'he' | 'en' | 'ar'

export const languages: Record<Language, { label: string; nativeLabel: string; dir: 'rtl' | 'ltr' }> = {
  he: { label: 'עברית', nativeLabel: 'עברית', dir: 'rtl' },
  en: { label: 'English', nativeLabel: 'English', dir: 'ltr' },
  ar: { label: 'العربية', nativeLabel: 'العربية', dir: 'rtl' },
}

export const translations: Record<Language, Translations> = { he, en, ar }
