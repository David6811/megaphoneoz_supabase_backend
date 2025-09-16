import { supabase } from '../config/supabase'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  displayName?: string
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })
    
    if (response.error) {
      throw new AuthError(response.error.message)
    }
    
    return response.data
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new AuthError(error.message)
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await supabase.auth.getUser()
    
    if (response.error) {
      throw new AuthError(response.error.message)
    }
    
    return response.data.user
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const signup = async (credentials: SignupCredentials) => {
  try {
    // Validate input
    if (!credentials.email || !credentials.password) {
      throw new AuthError('Email and password are required')
    }
    
    if (credentials.password.length < 6) {
      throw new AuthError('Password must be at least 6 characters long')
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(credentials.email)) {
      throw new AuthError('Please enter a valid email address')
    }
    
    // Sign up with Supabase
    const response = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          display_name: credentials.displayName
        }
      }
    })
    
    if (response.error) {
      throw new AuthError(response.error.message)
    }
    
    return {
      user: response.data.user,
      session: response.data.session,
      needsConfirmation: !response.data.session // If no session, email confirmation is needed
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const resendConfirmation = async (email: string) => {
  try {
    if (!email) {
      throw new AuthError('Email is required')
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })
    
    if (error) {
      throw new AuthError(error.message)
    }
    
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const resetPassword = async (email: string) => {
  try {
    if (!email) {
      throw new AuthError('Email is required')
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new AuthError('Please enter a valid email address')
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) {
      throw new AuthError(error.message)
    }
    
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const updatePassword = async (newPassword: string) => {
  try {
    if (!newPassword) {
      throw new AuthError('New password is required')
    }
    
    if (newPassword.length < 6) {
      throw new AuthError('Password must be at least 6 characters long')
    }
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      throw new AuthError(error.message)
    }
    
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(error instanceof Error ? error.message : 'Unknown error')
  }
}