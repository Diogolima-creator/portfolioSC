import { useTranslation } from '../hooks/useTranslation'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-ice-100 via-ice-200 to-ice-300 dark:from-ice-800 dark:via-ice-900 dark:to-ice-950">
        <div className="absolute inset-0 bg-gradient-radial from-primary-light/10 via-transparent to-transparent dark:from-primary-dark/10"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-ice-900 dark:text-ice-50 mb-4">SigiloCorp</h3>
            <p className="text-ice-600 dark:text-ice-400 mb-4">
              {t('footer.descricao')}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-ice-900 dark:text-ice-50 mb-4">
              {t('footer.links.title')}
            </h4>
            <ul className="space-y-2">
            <li>
                <a href="#sobre" className="text-ice-600 dark:text-ice-400 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                  {t('footer.links.sobreNos')}
                </a>
              </li>
              <li>
                <a href="#quem-somos" className="text-ice-600 dark:text-ice-400 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                  {t('footer.links.quemSomos')}
                </a>
              </li>
              <li>
                <a href="#servicos" className="text-ice-600 dark:text-ice-400 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                  {t('footer.links.servicos')}
                </a>
              </li>
              <li>
                <a href="#projetos" className="text-ice-600 dark:text-ice-400 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                  {t('footer.links.projetos')}
                </a>
              </li>
              <li>
                <a href="#contato" className="text-ice-600 dark:text-ice-400 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                  {t('footer.links.contato')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-ice-900 dark:text-ice-50 mb-4">
              {t('footer.contato.title')}
            </h4>
            <ul className="space-y-2">
              <li className="text-ice-600 dark:text-ice-400">
                {t('footer.contato.email')}
              </li>
              <li className="text-ice-600 dark:text-ice-400">
                {t('footer.contato.telefone')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ice-200 dark:border-ice-800 mt-8 pt-8 text-center">
          <p className="text-ice-600 dark:text-ice-400">
            © {currentYear} SigiloCorp. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
} 