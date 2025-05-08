import { useEffect, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function Hero() {
  const { t } = useTranslation()
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)

  const phrases = t('hero.frases') as string[]

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]
    const typingSpeed = 100
    const deletingSpeed = 50
    const waitingTime = 2000

    let timeout: number

    if (isWaiting) {
      timeout = setTimeout(() => {
        setIsWaiting(false)
        setIsDeleting(true)
      }, waitingTime)
    } else if (isDeleting) {
      if (currentText === '') {
        setIsDeleting(false)
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, deletingSpeed)
      }
    } else {
      if (currentText === currentPhrase) {
        setIsWaiting(true)
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1))
        }, typingSpeed)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentText, currentPhraseIndex, isDeleting, isWaiting, phrases])

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-4xl md:text-7xl font-bold mb-6 pb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark max-w-[70%] mx-auto">
          {currentText}
          <span className="animate-blink">|</span>
        </h1>
        <p className="text-lg md:text-xl text-ice-600 dark:text-ice-400 mb-8 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button className="bg-primary-light dark:bg-primary-dark text-white px-8 py-3 rounded-lg hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors">
            {t('hero.cta.primary')}
          </button>
          <button className="bg-transparent border border-ice-300 dark:border-ice-700 text-ice-700 dark:text-ice-300 px-8 py-3 rounded-lg hover:bg-ice-200 dark:hover:bg-ice-800 transition-colors">
            {t('hero.cta.secondary')}
          </button>
        </div>
      </div>
    </section>
  )
} 