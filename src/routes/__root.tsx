import { createRootRoute, Outlet } from '@tanstack/react-router'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ThemeProvider } from '../contexts/ThemeContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors font-jetbrains">
          <Outlet />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}
