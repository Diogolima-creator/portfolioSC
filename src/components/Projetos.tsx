import { motion } from 'framer-motion'
import { useTranslation } from '../hooks/useTranslation'
import { useState } from 'react';
import ProjetoModal, { type Projeto } from './ProjetoModal';
import PhoneMockup from './PhoneMockup';

export default function Projetos() {
  const { t } = useTranslation();
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projetos: Projeto[] = [
    {
      titulo: t('projetos.items.0.titulo'),
      resumo: t('projetos.items.0.resumo'),
      descricao: t('projetos.items.0.descricao'),
      imagem: '/images/vendperto.jpg',
      visualizacao: 'phone',
      plataformas: ['Android', 'iOS'],
      tecnologias: ['AWS Rekognition', 'React Native', 'TypeScript', 'OneSignal'],
      links: [
        { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.vendperto.app' },
        { label: 'App Store', url: 'https://apps.apple.com/br/app/vendperto/id6759847437?l=en-GB' },
      ],
    },
    {
      titulo: t('projetos.items.1.titulo'),
      resumo: t('projetos.items.1.resumo'),
      descricao: t('projetos.items.1.descricao'),
      imagem: '/images/fechalead.webp',
      imagemCard: '/images/fechalead-preview.webp',
      visualizacao: 'website',
      plataformas: [],
      tecnologias: ['Next.js', 'TypeScript', 'NestJS', 'PostgreSQL', 'Redis', 'Tailwind CSS'],
      links: [
        { label: t('projetos.visitSite'), url: 'https://fechalead.com.br/' },
      ],
    },
  ];

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

  const handleOpenModal = (projeto: Projeto) => {
    setSelectedProjeto(projeto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section id="projetos" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('projetos.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            {t('projetos.subtitle')}
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {projetos.map((projeto, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-card rounded-xl p-4 md:p-6 pb-0 border border-border hover:border-primary/50 transition-colors group flex flex-col w-full md:w-[340px] h-auto md:h-[600px] overflow-visible cursor-pointer"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              onClick={() => handleOpenModal(projeto)}
            >
              <motion.h3
                className="text-xl font-semibold mb-2 text-foreground"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {projeto.titulo}
              </motion.h3>
              <motion.p 
                className="text-muted-foreground mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                {projeto.resumo}
              </motion.p>
              <motion.div 
                className="flex flex-wrap justify-center gap-1 mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {[...projeto.plataformas, ...projeto.tecnologias].map((tecnologia, index) => (
                  <motion.span
                    key={tecnologia}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {tecnologia}
                  </motion.span>
                ))}
              </motion.div>
              <motion.div 
                className={`relative mt-auto flex min-h-[340px] w-full items-end justify-center md:min-h-0 md:flex-1 ${
                  projeto.visualizacao === 'website' ? 'overflow-hidden rounded-b-xl bg-muted' : 'pt-2'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                {projeto.visualizacao === 'phone' ? (
                  <PhoneMockup src={projeto.imagem} alt={projeto.titulo} />
                ) : (
                  <>
                    <img
                      src={projeto.imagemCard ?? projeto.imagem}
                      alt={projeto.titulo}
                      className="absolute inset-0 h-full w-full object-cover object-top"
                      loading="lazy"
                    />
                    {projeto.links[0] && (
                      <a
                        href={projeto.links[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="absolute bottom-4 right-4 z-10 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
                      >
                        {projeto.links[0].label} ↗
                      </a>
                    )}
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <ProjetoModal projeto={selectedProjeto} isOpen={isModalOpen} onClose={handleCloseModal} />
    </section>
  )
}
