import { motion } from 'framer-motion'
import { useTranslation } from '../hooks/useTranslation'
import { useState } from 'react';
import ProjetoModal, { type Projeto } from './ProjetoModal';

export default function Projetos() {
  const { t } = useTranslation();
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projetos: Projeto[] = [
    {
      titulo: t('projetos.items.0.titulo'),
      descricao: t('projetos.items.0.descricao'),
      imagem: '/images/teste2.png',
      tecnologias: ['React Native', 'TypeScript', 'Firebase', 'Cloudflare'],
      imagens: ['/images/teste.png'],
      url: 'https://play.google.com/store/apps/details?id=com.diogolimadev.conect',
    },
    {
      titulo: t('projetos.items.1.titulo'),
      descricao: t('projetos.items.1.descricao'),
      imagem: '/images/movimenta.png',
      tecnologias: ['React', 'Node.js', 'LinkedIn API', 'PostgreSQL'],
      imagens: [],
      url: 'https://movimenta-frontend.pages.dev/',
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
                {projeto.descricao}
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-2 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {projeto.tecnologias.map((tech, techIndex) => (
                  <motion.span
                    key={techIndex}
                    className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + techIndex * 0.1 }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </motion.div>
              <motion.div 
                className="relative w-full flex-1 mt-auto overflow-visible"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="absolute left-0 right-0 h-full">
                  <motion.img
                    src={projeto.imagem}
                    alt={projeto.titulo}
                    style={{ objectPosition: 'top' }}
                    className="w-full h-48 md:h-full object-cover rounded-b-xl shadow-lg"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <ProjetoModal projeto={selectedProjeto} isOpen={isModalOpen} onClose={handleCloseModal} />
    </section>
  )
}