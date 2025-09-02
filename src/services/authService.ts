import { supabase } from '../config/supabase'

export interface LoginCredentials {
  email: string
  password: string
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