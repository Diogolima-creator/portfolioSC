import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../translations'

export function useTranslation() {
  const { language } = useLanguage()
  
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value === undefined) return key
      value = value[k]
    }
    
    return value || key
  }
  
  return { t, language }
} 