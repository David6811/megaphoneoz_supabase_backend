import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material'
import { LoginPage } from './components/LoginPage'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { PostsPage } from './pages/Dashboard/PostsPage'
import { CommentsPage } from './pages/Dashboard/CommentsPage'
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

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

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/posts"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PostsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/comments"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CommentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>Settings Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
