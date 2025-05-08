import { useTranslation } from '../hooks/useTranslation'

export default function Projetos() {
  const { t } = useTranslation()

  const projetos = [
    {
      titulo: t('projetos.items.0.titulo'),
      descricao: t('projetos.items.0.descricao'),
      imagem: '/images/teste2.png',
      tecnologias: ['React Native', 'TypeScript', 'Firebase', 'Cloudflare']
    }
  ]

  return (
    <section id="projetos" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark">
            {t('projetos.title')}
          </h2>
          <p className="text-ice-600 dark:text-ice-400 text-lg max-w-3xl mx-auto">
            {t('projetos.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {projetos.map((projeto, index) => (
            <div
              key={index}
              className="bg-white/50 dark:bg-ice-900/50 backdrop-blur-lg rounded-xl p-6 pb-0 border border-ice-200 dark:border-ice-800 hover:border-primary-light/50 dark:hover:border-primary-dark/50 transition-colors group flex flex-col h-[800px] w-[400px] overflow-visible"
            >
              <h3 className="text-xl font-semibold mb-2 text-ice-900 dark:text-ice-50">
                {projeto.titulo}
              </h3>
              <p className="text-ice-600 dark:text-ice-400 mb-4">{projeto.descricao}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {projeto.tecnologias.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 text-sm bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="relative w-full flex-1 mt-auto overflow-visible">
                <div className="absolute left-0 right-0 h-full">
                  <img
                    src={projeto.imagem}
                    alt={projeto.titulo}
                    style={{ objectPosition: 'top' }}
                    className="w-full h-full object-cover rounded-b-xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 