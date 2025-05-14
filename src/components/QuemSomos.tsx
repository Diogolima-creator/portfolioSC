import { motion } from 'framer-motion'
import { useTranslation } from '../hooks/useTranslation'

export default function QuemSomos() {
  const { t, language } = useTranslation()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

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
      imagem: '/images/diogo.jpg',
      linkedin: 'https://www.linkedin.com/in/diogo-lima1408/'
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
      imagem: '/images/amorim.jpg',
      linkedin: 'https://www.linkedin.com/in/amorabot/'
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
      imagem: '/images/rafael.jpg',
      linkedin: 'https://www.linkedin.com/in/rafael-bamberg-868539114/'
    }
  ]

  return (
    <section id="quem-somos" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('quemSomos.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            {t('quemSomos.subtitle')}
          </p>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto mt-4">
            {t('quemSomos.descricao')}
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {integrantes.map((integrante, index) => (
            <motion.div 
              key={index} 
              variants={cardVariants}
              className="bg-card rounded-lg shadow-lg overflow-hidden text-center cursor-pointer p-4 md:p-6"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              onClick={() => window.open(integrante.linkedin, '_blank', 'noopener,noreferrer')}
              title={`Ver perfil de ${integrante.nome} no LinkedIn`}
            >
              <motion.div 
                className="flex justify-center p-4 md:p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.img 
                  src={integrante.imagem} 
                  alt={integrante.nome} 
                  className="w-32 h-32 rounded-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.div 
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-foreground">{integrante.nome}</h3>
                <p className="text-primary font-semibold text-base mb-2">{integrante.cargo[language]}</p>
                <p className="text-muted-foreground">{integrante.resumo[language]}</p>
                <div className="mt-4">
                  <span className="text-primary text-sm hover:underline">
                    {t('quemSomos.verLinkedin')}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 