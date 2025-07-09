import { useState, useEffect } from 'react'
import { LandingPage } from '@/components/LandingPage'
import { AuthForm } from '@/components/AuthForm'
import { WebsiteBuilder } from '@/components/WebsiteBuilder'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { blink } from '@/blink/client'

type AppState = 'landing' | 'auth' | 'builder'

interface User {
  id: string
  email: string
  username: string
}

function App() {
  const [appState, setAppState] = useState<AppState>('landing')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setIsLoading(state.isLoading)
      
      if (state.user) {
        setUser({
          id: state.user.id,
          email: state.user.email,
          username: state.user.displayName || state.user.email.split('@')[0]
        })
        setAppState('builder')
      } else {
        setUser(null)
        setAppState('landing')
      }
    })

    return unsubscribe
  }, [])

  const handleGetStarted = () => {
    setAppState('auth')
  }

  const handleAuth = async (userData: { email: string; username: string }) => {
    // For now, we'll simulate authentication
    // In a real app, this would be handled by the Blink SDK
    setUser({
      id: 'temp-user-id',
      email: userData.email,
      username: userData.username
    })
    setAppState('builder')
  }

  const handleLogout = () => {
    blink.auth.logout()
    setUser(null)
    setAppState('landing')
  }

  const handleBackToLanding = () => {
    setAppState('landing')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Sark
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {appState === 'landing' && (
          <LandingPage onGetStarted={handleGetStarted} />
        )}
        
        {appState === 'auth' && (
          <AuthForm 
            onBack={handleBackToLanding}
            onAuth={handleAuth}
          />
        )}
        
        {appState === 'builder' && user && (
          <WebsiteBuilder 
            user={user}
            onLogout={handleLogout}
          />
        )}
      </div>
    </ThemeProvider>
  )
}

export default App