import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import Projetos from './components/Projetos'
import QuemSomos from './components/QuemSomos'
import Recomendacoes from './components/Recomendacoes'
import Servicos from './components/Servicos'
import SobreNos from './components/SobreNos'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-ice-50 dark:bg-ice-900 text-ice-900 dark:text-ice-50 transition-colors">
          <Header />
          <main className="relative">
            {/* Background Elements */}
            <div className="fixed inset-0 bg-gradient-to-b from-ice-50 via-ice-100 to-ice-200 dark:from-ice-900 dark:via-ice-800 dark:to-ice-700">
              <div className="absolute inset-0 bg-gradient-radial from-primary-light/10 via-transparent to-transparent dark:from-primary-dark/10"></div>
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-light/20 dark:bg-primary-dark/20 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-light/20 dark:bg-secondary-dark/20 rounded-full filter blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <Hero />
              <SobreNos />
              <QuemSomos />
              <Servicos />
              <Projetos />
              <Recomendacoes />
            </div>
          </main>
          <Footer />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
