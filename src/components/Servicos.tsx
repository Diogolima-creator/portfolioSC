import { useTranslation } from '../hooks/useTranslation'

export default function Servicos() {
  const { t } = useTranslation()

  const servicos = [
    {
      titulo: t('servicos.items.0.titulo'),
      descricao: t('servicos.items.0.descricao'),
      icone: (
        <svg
          className="w-12 h-12 text-primary-light dark:text-primary-dark transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      )
    },
    {
      titulo: t('servicos.items.1.titulo'),
      descricao: t('servicos.items.1.descricao'),
      icone: (
        <svg
          className="w-12 h-12 text-primary-light dark:text-primary-dark group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      )
    },
    {
      titulo: t('servicos.items.2.titulo'),
      descricao: t('servicos.items.2.descricao'),
      icone: (
        <svg
          className="w-12 h-12 text-primary-light dark:text-primary-dark group-hover:translate-y-[-4px] transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      )
    },
    {
      titulo: t('servicos.items.3.titulo'),
      descricao: t('servicos.items.3.descricao'),
      icone: (
        <svg
          className="w-12 h-12 text-primary-light dark:text-primary-dark group-hover:animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      )
    },
    {
      titulo: t('servicos.items.4.titulo'),
      descricao: t('servicos.items.4.descricao'),
      icone: (
        <div className="relative">
          <svg
            className="w-12 h-12 text-primary-light dark:text-primary-dark group-hover:animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
      )
    },
    {
      titulo: t('servicos.items.5.titulo'),
      descricao: t('servicos.items.5.descricao'),
      icone: (
        <svg
          className="w-12 h-12 text-primary-light dark:text-primary-dark group-hover:animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )
    }
  ]

  return (
    <section id="servicos" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark">
            {t('servicos.title')}
          </h2>
          <p className="text-ice-600 dark:text-ice-400 text-lg max-w-3xl mx-auto">
            {t('servicos.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicos.map((servico, index) => (
            <div
              key={index}
              className="bg-white/50 dark:bg-ice-900/50 backdrop-blur-lg rounded-xl p-6 border border-ice-200 dark:border-ice-800 hover:border-primary-light/50 dark:hover:border-primary-dark/50 transition-colors group"
            >
              <div className="mb-4">{servico.icone}</div>
              <h3 className="text-xl font-semibold mb-2 text-ice-900 dark:text-ice-50">
                {servico.titulo}
              </h3>
              <p className="text-ice-600 dark:text-ice-400">{servico.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 