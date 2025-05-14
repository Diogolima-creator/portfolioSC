import { motion, useAnimationFrame, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

export default function WhyBrig() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const pathRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [showChest, setShowChest] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [showBoatAndX, setShowBoatAndX] = useState(true);
  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, margin: '-100px' });
  const [revealDone, setRevealDone] = useState(false);
  const caminhoRef = useRef(null);
  const caminhoInView = useInView(caminhoRef, { once: true, margin: '-100px' });

  // Parâmetros de animação
  const speed = 0.0015;

  // Inicia o movimento do barco só após o reveal
  useEffect(() => {
    if (caminhoInView) {
      setTimeout(() => setRevealDone(true), 500);
    }
  }, [caminhoInView]);

  // Animação em loop
  useAnimationFrame(() => {
    if (!revealDone) return;
    if (isWaiting) return;
    if (progress >= 1) {
      setIsWaiting(true);
      setShowBoatAndX(false);
      setShowChest(true);
      setTimeout(() => {
        setChestOpen(true); // 1º chacoalhada
        setTimeout(() => {
          setChestOpen(false); // espera
          setTimeout(() => {
            setChestOpen(true); // 2º chacoalhada
            setTimeout(() => {
              setShowChest(false); // desaparece
              setShowBoatAndX(true);
              setProgress(0);
              setIsWaiting(false);
              setChestOpen(false);
            }, 600); // duração da 2ª chacoalhada
          }, 900); // espera entre as chacoalhadas
        }, 600); // duração da 1ª chacoalhada
      }, 400); // tempo até a 1ª chacoalhada
    } else {
      setProgress((prev) => Math.min(prev + speed, 1));
    }
  });

  // Calcula a posição do barco no path
  let x = 0, y = 0;
  let xEnd = 0, yEnd = 0;
  if (pathRef.current) {
    const length = pathRef.current.getTotalLength();
    const point = pathRef.current.getPointAtLength(progress * length);
    x = point.x;
    y = point.y;
    const endPoint = pathRef.current.getPointAtLength(length);
    xEnd = endPoint.x;
    yEnd = endPoint.y;
  }

  return (
    <section id="por-que-brig" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            {t('sobreNos.porquebrig.title')}
          </h2>
          <div className="relative h-64 mb-12 overflow-visible hidden [@media(min-width:800px)]:block">
            <motion.div
              ref={caminhoRef}
              initial={{ width: 0, opacity: 0, right: 0, left: 'auto' }}
              animate={caminhoInView ? { width: '100%', opacity: 1, right: 0, left: 'auto' } : { width: 0, opacity: 1, right: 0, left: 'auto' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%',
                overflow: 'hidden',
                position: 'absolute',
                right: 0,
                top: 0,
                zIndex: 2,
                pointerEvents: 'none',
                minWidth: 80,
              }}
            >
              <svg width="100%" height="160" viewBox="0 0 900 160" fill="none">
                <path
                  ref={pathRef}
                  d="M850,120 Q650,40 450,120 Q250,200 50,120"
                  stroke={theme === 'dark' ? '#fff' : '#000'}
                  strokeDasharray="14,14"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
              <motion.div
                animate={{ opacity: showBoatAndX ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: "absolute",
                  left: x - 50,
                  top: y - 50,
                  width: 100,
                  height: 100,
                  pointerEvents: "none",
                  willChange: "transform",
                  transform: `translate3d(0,0,0)`
                }}
              >
                <img
                  src={theme === 'dark' ? "/images/iconWhiteNovo.png" : "/images/iconNovo4.png"}
                  alt="Barco"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </motion.div>
              <motion.div
                animate={{ opacity: showBoatAndX ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: "absolute",
                  left: xEnd - 30,
                  top: yEnd - 30,
                  width: 60,
                  height: 60,
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <line x1="12" y1="12" x2="48" y2="48" stroke="#d90429" strokeWidth="10" strokeLinecap="round"/>
                  <line x1="48" y1="12" x2="12" y2="48" stroke="#d90429" strokeWidth="10" strokeLinecap="round"/>
                </svg>
              </motion.div>
              {/* Baú de tesouro */}
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={showChest ? { 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  rotate: chestOpen ? [0, -8, 8, -5, 5, 0] : 0
                } : { scale: 0, opacity: 0, y: 20 }}
                transition={{ 
                  duration: chestOpen ? 0.6 : 0.5,
                  ease: "backOut",
                  rotate: chestOpen ? {
                    duration: 0.6,
                    times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                  } : undefined
                }}
                style={{
                  position: "absolute",
                  left: xEnd - 50,
                  top: yEnd - 100,
                  width: 100,
                  height: 100,
                  pointerEvents: "none",
                  zIndex: 3,
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                }}
              >
                <img
                  src="/images/chest2.png"
                  alt="Baú do Tesouro"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: theme === 'dark' ? 'brightness(1.2)' : 'none'
                  }}
                />
                {/* Brilho do tesouro e partículas só se quiser manter, pode remover se não quiser */}
              </motion.div>
            </motion.div>
          </div>
          <div ref={textRef} className="space-y-6 text-foreground">
            <motion.p
              className="text-lg leading-relaxed"
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {t('sobreNos.porquebrig.description')}
            </motion.p>
            <motion.p
              className="text-lg leading-relaxed"
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {t('sobreNos.porquebrig.paragraph2')}
            </motion.p>
            <motion.p
              className="text-lg leading-relaxed"
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              {t('sobreNos.porquebrig.paragraph3')}
            </motion.p>
            <motion.p
              className="text-lg leading-relaxed font-semibold"
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              {t('sobreNos.porquebrig.paragraph4')}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
} 