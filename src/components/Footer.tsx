import { useTranslation } from '../hooks/useTranslation'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted to-muted/50">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">BRIG</h3>
            <p className="text-muted-foreground mb-4">
              {t('footer.descricao')}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">
              {t('footer.links.title')}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.links.sobreNos')}
                </a>
              </li>
              <li>
                <a href="#quem-somos" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.links.quemSomos')}
                </a>
              </li>
              <li>
                <a href="#servicos" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.links.servicos')}
                </a>
              </li>
              <li>
                <a href="#projetos" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.links.projetos')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">
              {t('footer.contato.title')}
            </h4>
            <ul className="space-y-2">
              <li className="flex flex-col text-muted-foreground space-y-1">
                <span>{t('footer.contato.email')}</span>
                <span>{t('footer.contato.email2')}</span>
                <span>{t('footer.contato.email3')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © {currentYear} BRIG. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
} 