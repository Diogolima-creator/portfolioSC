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
        <div className="min-h-screen bg-background text-foreground transition-colors font-jetbrains">
          <Header />
          <main className="relative">
            {/* Background Elements */}
            <div className="fixed inset-0 bg-gradient-to-b from-background via-muted to-muted/50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-muted/10 via-transparent to-transparent"></div>
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
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
