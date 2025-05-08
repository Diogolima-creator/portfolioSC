import { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from '../hooks/useTranslation'
import LanguageSelector from './LanguageSelector'

export default function Header() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-ice-50/80 dark:bg-ice-900/80 backdrop-blur-lg shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo + texto */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark text-transparent bg-clip-text">
              <img src="/icon-nobg.png" alt="Logo" className="w-16 h-16" />
              SigiloCorp
            </a>
          </div>

          {/* Itens do menu centralizados */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#sobre" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
              {t('sobreNos.title')}
            </a>
            <a href="#quem-somos" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
              {t('header.quemSomos')}
            </a>
            <a href="#servicos" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
              {t('header.servicos')}
            </a>
            <a href="#projetos" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
              {t('header.projetos')}
            </a>
            <a href="#recomendacoes" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
              {t('header.recomendacoes')}
            </a>
          </nav>

          {/* Botões à direita (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-ice-200 dark:hover:bg-ice-800 transition-colors"
              aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-ice-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-ice-200 dark:hover:bg-ice-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6 text-white dark:text-ice-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 px-6 bg-ice-100/95 dark:bg-ice-900 w-full absolute left-0 top-20 z-40 shadow-xl transition-colors">
            <nav className="flex flex-col space-y-4">
              <div className="flex items-center justify-end space-x-4 mb-4">
                <LanguageSelector />
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-ice-200 dark:hover:bg-ice-800 transition-colors"
                  aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
                >
                  {theme === 'light' ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-ice-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <a href="#sobre" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                {t('sobreNos.title')}
              </a>
              <a href="#quem-somos" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                {t('header.quemSomos')}
              </a>
              <a href="#servicos" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                {t('header.servicos')}
              </a>
              <a href="#projetos" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                {t('header.projetos')}
              </a>
              <a href="#recomendacoes" className="text-ice-900 dark:text-ice-50 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                {t('header.recomendacoes')}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 