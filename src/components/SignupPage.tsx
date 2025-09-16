import React, { useState } from 'react'
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
  Link,
  Divider
} from '@mui/material'
import { signup, resendConfirmation, SignupCredentials, AuthError } from '../services/authService'

interface SignupPageProps {
  onSignupSuccess?: () => void
  onSwitchToLogin?: () => void
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

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
        onSignupSuccess?.()
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

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Create Account
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSignup} sx={{ mt: 1 }}>
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
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                helperText="Minimum 6 characters"
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !email || !password || !confirmPassword}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {needsConfirmation && (
                <>
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
                </>
              )}

              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={onSwitchToLogin}
                    variant="body2"
                    sx={{ textDecoration: 'none' }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}