import React, { useState } from 'react'
import { LoginPage } from './LoginPage'
import { SignupPage } from './SignupPage'

interface AuthPageProps {
  onAuthSuccess?: () => void
  initialMode?: 'login' | 'signup'
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onAuthSuccess, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  const handleSwitchToSignup = () => {
    setMode('signup')
  }

  const handleSwitchToLogin = () => {
    setMode('login')
  }

  if (mode === 'signup') {
    return (
      <SignupPage
        onSignupSuccess={onAuthSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />
    )
  }

  return (
    <LoginPage
      onLoginSuccess={onAuthSuccess}
      onSwitchToSignup={handleSwitchToSignup}
    />
  )
}