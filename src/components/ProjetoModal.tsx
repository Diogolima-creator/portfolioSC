import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const images = projeto?.imagens?.length ? [projeto.imagem, ...projeto.imagens] : projeto ? [projeto.imagem] : [];

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      imageRefs.current = [];
    }
  }, [isOpen, projeto]);

  // Track visible images with IntersectionObserver
  useEffect(() => {
    if (!scrollContainerRef.current || images.length <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.findIndex((ref) => ref === entry.target);
            if (index !== -1) {
              setCurrentImageIndex(index);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.5,
      }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [images.length, isOpen]);

  const scrollToImage = (index: number) => {
    if (imageRefs.current[index]) {
      imageRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  if (!projeto) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card text-card-foreground w-[90%] max-w-5xl h-[85vh] rounded-xl shadow-xl flex flex-col relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-border relative">
              <h3 className="text-xl font-bold text-foreground">{projeto.titulo}</h3>
              <button
                onClick={onClose}
                className="ml-auto bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 border-2 border-red-300 dark:border-red-700 hover:border-red-500 dark:hover:border-red-500 transition-colors w-10 h-10 flex items-center justify-center rounded-full shadow-lg"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6">
                {/* Scrollable Image Gallery */}
                {images.length > 1 ? (
                  <div className="space-y-4">
                    {/* Thumbnail Navigation */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => scrollToImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? 'border-primary ring-2 ring-primary/20 scale-105'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${projeto.titulo} - Imagem ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Main Scrollable Image Container */}
                    <div
                      ref={scrollContainerRef}
                      className="space-y-4 max-h-[500px] overflow-y-auto snap-y snap-proximity rounded-lg scrollbar-thin bg-muted/30 p-2"
                    >
                      {images.map((img, index) => (
                        <div
                          key={index}
                          ref={(el) => (imageRefs.current[index] = el)}
                          className="snap-center w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center"
                        >
                          <img
                            src={img}
                            alt={`${projeto.titulo} - Imagem ${index + 1}`}
                            className="w-full h-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Image Counter */}
                    <div className="text-center">
                      <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        Imagem {currentImageIndex + 1} de {images.length}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Single Image */
                  <div className="relative bg-muted rounded-lg overflow-y-auto scrollbar-thin max-h-[400px]">
                    <img
                      src={images[0]}
                      alt={projeto.titulo}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}

                <p className="mt-6 text-muted-foreground">{projeto.descricao}</p>

                <div className="mt-6">
                  <h4 className="font-semibold text-foreground mb-3">Tecnologias:</h4>
                  <div className="flex flex-wrap gap-2">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
