import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FaBullseye, FaRegCalendarCheck, FaRegLightbulb } from 'react-icons/fa'
import { useTranslation } from '../hooks/useTranslation'

const abas = [
  {
    key: 'metas',
    icon: FaBullseye,
    label: 'sobreNos.abas.metas',
    titulo: 'sobreNos.metas.titulo',
    descricao: 'sobreNos.metas.descricao',
    botao: 'sobreNos.metas.botao',
    imagem: '/images/metas.png'
  },
  {
    key: 'objetivos',
    icon: FaRegLightbulb,
    label: 'sobreNos.abas.objetivos',
    titulo: 'sobreNos.objetivos.titulo',
    descricao: 'sobreNos.objetivos.descricao',
    botao: 'sobreNos.objetivos.botao',
    imagem: '/images/objetivos.png'
  },
  {
    key: 'planejamento',
    icon: FaRegCalendarCheck,
    label: 'sobreNos.abas.planejamento',
    titulo: 'sobreNos.planejamento.titulo',
    descricao: 'sobreNos.planejamento.descricao',
    botao: 'sobreNos.planejamento.botao',
    imagem: '/images/planejamento.png'
  }
]

const missoesValor = [
  {
    titulo: 'sobreNos.valor1.titulo',
    descricao: 'sobreNos.valor1.descricao',
    icone: FaBullseye
  },
  {
    titulo: 'sobreNos.valor2.titulo',
    descricao: 'sobreNos.valor2.descricao',
    icone: FaRegLightbulb
  },
  {
    titulo: 'sobreNos.valor3.titulo',
    descricao: 'sobreNos.valor3.descricao',
    icone: FaRegCalendarCheck
  }
]

export default function SobreNos() {
  const { t } = useTranslation()
  const [abaAtiva, setAbaAtiva] = useState(0)

  const handleAbaClick = (idx: number) => {
    if (idx === abaAtiva) return
    setAbaAtiva(idx)
  }

  return (
    <section id="sobre" className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-5xl font-bold mb-10 text-center text-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {t('sobreNos.title')}
        </motion.h2>

        <motion.div 
          className="bg-card rounded-3xl p-10 flex flex-col md:flex-row gap-10 border border-border shadow-2xl max-w-6xl mx-auto min-h-[420px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex flex-col flex-1">
              {abas.map((aba, idx) => {
                const Icon = aba.icon
                return (
                  <motion.button
                    key={aba.key}
                    onClick={() => handleAbaClick(idx)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl mb-3 text-left transition-colors text-lg
                      ${abaAtiva === idx
                        ? 'bg-primary/10 text-primary font-bold shadow'
                        : 'hover:bg-muted text-muted-foreground hover:text-primary'
                      }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{t(aba.label)}</span>
                  </motion.button>
                )
              })}
            </div>
            <div className="hidden md:flex mx-4">
              <div className="w-px bg-border h-full" style={{ minHeight: '200px' }} />
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-10">
            <motion.div 
              className="flex-1 flex flex-col items-start justify-center"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {t(abas[abaAtiva].titulo)}
              </h3>
              <p className="text-muted-foreground mb-6 text-lg md:text-xl">
                {t(abas[abaAtiva].descricao)}
              </p>
            </motion.div>
            <motion.div 
              className="w-full md:w-[400px] flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={abaAtiva}
                  src={abas[abaAtiva].imagem}
                  alt={t(abas[abaAtiva].titulo)}
                  className="rounded-2xl shadow-2xl object-cover w-full h-[320px] md:h-[400px] bg-muted"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {missoesValor.map((valor, idx) => {
            const Icon = valor.icone
            return (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut"
                    }
                  }
                }}
                className="bg-card rounded-2xl p-8 flex flex-col items-center text-center shadow-lg border border-border h-full"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Icon className="w-10 h-10 mb-4 text-primary" />
                </motion.div>
                <motion.h4 
                  className="text-xl font-bold mb-2 text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  {t(valor.titulo)}
                </motion.h4>
                <motion.p 
                  className="text-muted-foreground text-base"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  {t(valor.descricao)}
                </motion.p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
} 