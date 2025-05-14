import { motion } from 'framer-motion'
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 pb-4 text-foreground max-w-full md:max-w-xl mx-auto">
            {currentText}
            <motion.span 
              className="animate-blink"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            >
              |
            </motion.span>
          </h1>
        </motion.div>

        <motion.p 
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl md:max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div 
          className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.button 
            className="bg-primary text-primary-foreground px-6 md:px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('hero.cta.primary')}
          </motion.button>
          <motion.button 
            className="bg-secondary text-secondary-foreground px-6 md:px-8 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('hero.cta.secondary')}
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
} 