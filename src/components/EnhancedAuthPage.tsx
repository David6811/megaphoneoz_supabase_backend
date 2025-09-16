import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Avatar,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Divider,
  Link,
  Tabs,
  Tab
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as SignupIcon,
  Security as SecurityIcon
} from '@mui/icons-material'
import { login, signup, resendConfirmation, LoginCredentials, SignupCredentials, AuthError } from '../services/authService'

interface EnhancedAuthPageProps {
  initialMode?: 'login' | 'signup'
  onAuthSuccess?: () => void
}

export const EnhancedAuthPage: React.FC<EnhancedAuthPageProps> = ({ 
  initialMode = 'login',
  onAuthSuccess 
}) => {
  const theme = useTheme()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  
  // Common form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Signup specific states
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'login' | 'signup') => {
    setMode(newValue)
    setError(null)
    setSuccess(null)
    setNeedsConfirmation(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const credentials: LoginCredentials = { email, password }

    try {
      await login(credentials)
      console.log('Login successful')
      onAuthSuccess?.()
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const credentials: SignupCredentials = {
      email,
      password,
      displayName: displayName || undefined
    }

    try {
      const result = await signup(credentials)
      console.log('Signup successful:', result)
      
      if (result.needsConfirmation) {
        setNeedsConfirmation(true)
        setSuccess('Please check your email and click the confirmation link to complete your registration.')
      } else {
        setSuccess('Account created successfully! You are now logged in.')
        onAuthSuccess?.()
      }
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setResendLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await resendConfirmation(email)
      setSuccess('Confirmation email sent! Please check your inbox.')
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('Failed to resend confirmation email')
      }
    } finally {
      setResendLoading(false)
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.main} 0%, 
          ${theme.palette.secondary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha('#fff', 0.1),
          animation: 'float 6s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: alpha('#fff', 0.08),
          animation: 'float 8s ease-in-out infinite reverse'
        }}
      />

      <Container component="main" maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Card Header with Gradient */}
            <Box
              sx={{
                background: `linear-gradient(135deg, 
                  ${alpha('#fff', 0.95)} 0%, 
                  ${alpha('#fff', 0.85)} 100%)`,
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
                py: 4,
                px: 3
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    margin: '0 auto',
                    background: theme.gradients.primary,
                    mb: 2
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Typography variant="h4" component="h1" gutterBottom sx={{ 
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {mode === 'login' ? 'Welcome Back' : 'Join Us'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {mode === 'login' 
                    ? 'Sign in to access your CMS dashboard' 
                    : 'Create your account to get started'
                  }
                </Typography>
              </motion.div>

              {/* Mode Switcher Tabs */}
              <Tabs
                value={mode}
                onChange={handleTabChange}
                centered
                sx={{
                  minHeight: 'auto',
                  '& .MuiTabs-indicator': {
                    background: theme.gradients.primary,
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minHeight: 'auto',
                    py: 1,
                  }
                }}
              >
                <Tab label="Sign In" value="login" />
                <Tab label="Create Account" value="signup" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    {success}
                  </Alert>
                </motion.div>
              )}

              <Box component="form" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <TextField
                      margin="normal"
                      fullWidth
                      id="displayName"
                      label="Display Name (Optional)"
                      name="displayName"
                      autoComplete="username"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading}
                      helperText="This will be shown as your author name"
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus={mode === 'login'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      }
                    }}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    helperText={mode === 'signup' ? 'Minimum 6 characters' : undefined}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: mode === 'signup' ? 2 : 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      }
                    }}
                  />
                </motion.div>

                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                  >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2
                          }
                        }
                      }}
                    />
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={
                      loading || !email || !password || 
                      (mode === 'signup' && !confirmPassword)
                    }
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : mode === 'login' ? (
                        <LoginIcon />
                      ) : (
                        <SignupIcon />
                      )
                    }
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      background: theme.gradients.primary,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
                      },
                      '&:disabled': {
                        background: alpha(theme.palette.primary.main, 0.6),
                        transform: 'none',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {loading 
                      ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') 
                      : (mode === 'login' ? 'Sign In' : 'Create Account')
                    }
                  </Button>
                </motion.div>

                {mode === 'signup' && needsConfirmation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Didn't receive the email?
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={handleResendConfirmation}
                        disabled={resendLoading}
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        {resendLoading ? (
                          <>
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            Sending...
                          </>
                        ) : (
                          'Resend Confirmation Email'
                        )}
                      </Button>
                    </Box>
                  </motion.div>
                )}
              </Box>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Powered by Megaphone OZ CMS
                  </Typography>
                </Box>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* CSS Keyframes for animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
        `}
      </style>
    </Box>
  )
}