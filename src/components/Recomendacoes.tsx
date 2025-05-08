import { useTranslation } from '../hooks/useTranslation'

interface Recomendacao {
  nome: string
  cargo: string
  texto: string
}

export default function Recomendacoes() {
  const { t } = useTranslation()

  return (
    <section id="recomendacoes" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark">
            {t('recomendacoes.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(t('recomendacoes.items') as Recomendacao[]).map((recomendacao, index) => (
            <div
              key={index}
              className="bg-white/50 dark:bg-ice-900/50 backdrop-blur-lg rounded-xl p-6 border border-ice-200 dark:border-ice-800 hover:border-primary-light/50 dark:hover:border-primary-dark/50 transition-colors"
            >
              <p className="text-ice-600 dark:text-ice-400 mb-4">"{recomendacao.texto}"</p>
              <div>
                <h3 className="text-ice-900 dark:text-ice-50 font-semibold">{recomendacao.nome}</h3>
                <p className="text-primary-light dark:text-primary-dark">{recomendacao.cargo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 