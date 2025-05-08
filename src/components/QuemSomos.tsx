import { useTranslation } from '../hooks/useTranslation'

export default function QuemSomos() {
  const { t, language } = useTranslation()

  const integrantes = [
    {
      nome: 'Diogo',
      cargo: {
        pt: 'Engenheiro Fullstack',
        en: 'Fullstack Engineer'
      },
      resumo: {
        pt: 'Atualmente cursando Engenharia da Computação na UFMS, possui sólida experiência em desenvolvimento centrado no usuário e criação de soluções escaláveis. Atua no desenvolvimento de aplicações fullstack com foco na entrega de produtos eficientes e intuitivos.',
        en: 'Currently pursuing a degree in Computer Engineering at UFMS, with solid experience in user-centered development and scalable solutions. Works on fullstack application development with a focus on delivering efficient and intuitive products.'
      },
      imagem: '/images/diogo.jpg' // Substitua pelo caminho correto da imagem
    },
    {
      nome: 'Daniel',
      cargo: {
        pt: 'Engenheiro Backend',
        en: 'Backend Engineer'
      },
      resumo: {
        pt: 'Graduado em Sistemas e Mídias Digitais pela UFC, possui forte atuação em engenharia de software com foco em inteligência artificial. Tem ampla experiência em documentação técnica, desenvolvimento backend e construção de produtos robustos e orientados a dados.',
        en: 'Graduated in Digital Systems and Media from UFC, with strong expertise in software engineering focused on artificial intelligence. Has extensive experience in technical documentation, backend development, and building robust, data-oriented products.'
      },
      imagem: '/images/amorim.jpg' // Substitua pelo caminho correto da imagem
    },
    {
      nome: 'Rafael',
      cargo: {
        pt: 'Engenheiro Fullstack',
        en: 'Fullstack Engineer'
      },
      resumo: {
        pt: 'Profissional com sólida experiência em desenvolvimento frontend e backend, atuando em projetos com metodologias ágeis e foco em escalabilidade. Contribui para a entrega de soluções tecnológicas inovadoras e alinhadas às necessidades do negócio.',
        en: 'Professional with solid experience in frontend and backend development, working on projects with agile methodologies and a focus on scalability. Contributes to the delivery of innovative technological solutions aligned with business needs.'
      },
      imagem: '/images/rafael.jpg' // Substitua pelo caminho correto da imagem
    }
  ]

  return (
    <section id="quem-somos" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark">
            {t('quemSomos.title')}
          </h2>
          <p className="text-ice-600 dark:text-ice-400 text-lg max-w-3xl mx-auto">
            {t('quemSomos.subtitle')}
          </p>
          <p className="text-ice-600 dark:text-ice-400 text-lg max-w-3xl mx-auto mt-4">
            {t('quemSomos.descricao')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {integrantes.map((integrante, index) => (
            <div key={index} className="bg-white dark:bg-ice-800 rounded-lg shadow-lg overflow-hidden text-center">
              <div className="flex justify-center p-6">
                <img src={integrante.imagem} alt={integrante.nome} className="w-32 h-32 rounded-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-ice-900 dark:text-ice-50">{integrante.nome}</h3>
                <p className="text-primary-light dark:text-primary-dark font-semibold text-base mb-2">{integrante.cargo[language]}</p>
                <p className="text-ice-600 dark:text-ice-400">{integrante.resumo[language]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 