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
  const [imgTransition, setImgTransition] = useState(false)

  // Função para trocar de aba com animação
  const handleAbaClick = (idx: number) => {
    if (idx === abaAtiva) return
    setImgTransition(true)
    setTimeout(() => {
      setAbaAtiva(idx)
      setImgTransition(false)
    }, 300)
  }

  return (
    <section id="sobre" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark">
          {t('sobreNos.title')}
        </h2>
        <div className="bg-white/10 dark:bg-ice-900/60 backdrop-blur-2xl rounded-3xl p-10 flex flex-col md:flex-row gap-10 border border-ice-200 dark:border-ice-800 shadow-2xl max-w-6xl mx-auto min-h-[420px]">
          {/* Menu lateral + Separator */}
          <div className="flex flex-row w-full md:w-1/4 items-stretch">
            <div className="flex flex-col flex-1">
              {abas.map((aba, idx) => {
                const Icon = aba.icon
                return (
                  <button
                    key={aba.key}
                    onClick={() => handleAbaClick(idx)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl mb-3 text-left transition-colors text-lg
                      ${abaAtiva === idx
                        ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark font-bold shadow'
                        : 'hover:bg-ice-100 dark:hover:bg-ice-800/20 text-ice-300 dark:text-ice-300 hover:text-primary-light dark:hover:text-primary-dark'
                      }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{t(aba.label)}</span>
                  </button>
                )
              })}
            </div>
            <div className="hidden md:flex mx-4">
              <div className="w-px bg-ice-200 dark:bg-ice-800 h-full" style={{ minHeight: '200px' }} />
            </div>
          </div>
          {/* Texto + Imagem */}
          <div className="flex-1 flex flex-col md:flex-row items-start gap-10">
            <div className="flex-1 flex flex-col items-start justify-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-4 text-ice-900 dark:text-ice-50">
                {t(abas[abaAtiva].titulo)}
              </h3>
              <p className="text-ice-600 dark:text-ice-400 mb-6 text-lg md:text-xl">
                {t(abas[abaAtiva].descricao)}
              </p>
            </div>
            <div className="w-full md:w-[400px] flex-shrink-0">
              <img
                src={abas[abaAtiva].imagem}
                alt={t(abas[abaAtiva].titulo)}
                className={`rounded-2xl shadow-2xl object-cover w-full h-[320px] md:h-[400px] bg-gradient-to-br from-primary-light/30 to-secondary-light/30 dark:from-primary-dark/30 dark:to-secondary-dark/30
                  transition-all duration-500
                  ${imgTransition ? 'opacity-0 -translate-x-10 scale-95' : 'opacity-100 translate-x-0 scale-100'}`}
                style={{ willChange: 'opacity, transform' }}
              />
            </div>
          </div>
        </div>
        {/* Missões de Valor */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {missoesValor.map((valor, idx) => {
            const Icon = valor.icone
            return (
              <div key={idx} className="bg-white/20 dark:bg-ice-900/70 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg border border-ice-200 dark:border-ice-800 h-full">
                <Icon className="w-10 h-10 mb-4 text-primary-light dark:text-primary-dark" />
                <h4 className="text-xl font-bold mb-2 text-ice-900 dark:text-ice-50">{t(valor.titulo)}</h4>
                <p className="text-ice-600 dark:text-ice-400 text-base">{t(valor.descricao)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
} 