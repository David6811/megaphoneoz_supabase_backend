import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import { theme } from './theme/theme'
import { EnhancedLoginPage } from './components/EnhancedLoginPage'
import { EnhancedDashboardLayout } from './components/Layout/EnhancedDashboardLayout'
import { EnhancedDashboardPage } from './pages/Dashboard/EnhancedDashboardPage'
import { EnhancedPostsPage } from './pages/Dashboard/EnhancedPostsPage'
import { CommentsPage } from './pages/Dashboard/CommentsPage'
import { CreateNewsArticle } from './pages/Posts/CreateNewsArticle'
import { supabase } from './config/supabase'
import { User } from '@supabase/supabase-js'

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
      <Router basename={process.env.NODE_ENV === 'production' ? '/megaphoneoz_supabase_backend' : ''}>
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <EnhancedLoginPage />
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EnhancedDashboardLayout>
                  <EnhancedDashboardPage />
                </EnhancedDashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/posts"
            element={
              <ProtectedRoute>
                <EnhancedDashboardLayout>
                  <EnhancedPostsPage />
                </EnhancedDashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/posts/create"
            element={
              <ProtectedRoute>
                <EnhancedDashboardLayout>
                  <CreateNewsArticle />
                </EnhancedDashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/comments"
            element={
              <ProtectedRoute>
                <EnhancedDashboardLayout>
                  <CommentsPage />
                </EnhancedDashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <EnhancedDashboardLayout>
                  <div>Settings Page - Coming Soon</div>
                </EnhancedDashboardLayout>
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
