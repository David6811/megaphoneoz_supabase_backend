import React, { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { LoginPage } from './components/LoginPage'
import { supabase } from './config/supabase'
import { User } from '@supabase/supabase-js'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
})

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLoginSuccess = () => {
    console.log('User logged in successfully!')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {user ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Welcome, {user.email}!</h1>
          <p>You are successfully logged in.</p>
          <button onClick={() => supabase.auth.signOut()}>
            Sign Out
          </button>
        </div>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </ThemeProvider>
  )
}

export default App
