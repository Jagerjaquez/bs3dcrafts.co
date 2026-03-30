'use client'

import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  emailVerified: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setState({ user: data.user, loading: false, error: null })
      } else {
        setState({ user: null, loading: false, error: null })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Giriş başarısız')
      }

      setState({ user: data.user, loading: false, error: null })
      return data.user
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      throw error
    }
  }

  const register = async (userData: {
    email: string
    password: string
    name: string
    phone?: string
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Kayıt başarısız')
      }

      setState({ user: data.user, loading: false, error: null })
      return data.user
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setState({ user: null, loading: false, error: null })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    refetch: checkAuth,
  }
}
