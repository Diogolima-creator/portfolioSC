import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export type Projeto = {
  titulo: string;
  descricao: string;
  imagem: string;
  tecnologias: string[];
  imagens?: string[];
  url?: string;
};

type ProjetoModalProps = {
  projeto: Projeto | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ProjetoModal({ projeto, isOpen, onClose }: ProjetoModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = projeto?.imagens?.length ? [projeto.imagem, ...projeto.imagens] : projeto ? [projeto.imagem] : [];

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, projeto]);

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!projeto) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card text-card-foreground w-[90%] max-w-xl max-h-[90vh] rounded-xl overflow-hidden shadow-xl flex flex-col relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-card-foreground hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">{projeto.titulo}</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="relative bg-muted rounded-lg h-80">
                {images.length > 0 && (
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt={projeto.titulo}
                    className="w-full h-full object-cover rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 text-foreground p-2 rounded-full hover:bg-muted transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 text-foreground p-2 rounded-full hover:bg-muted transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}
              </div>

              <p className="mt-4 text-muted-foreground">{projeto.descricao}</p>

              <div className="mt-4">
                <h4 className="font-semibold text-foreground">Tecnologias:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {projeto.tecnologias.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {projeto.url && (
                <div className="mt-6">
                  <a
                    href={projeto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Ver Projeto
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
