import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay token guardado
    const token = localStorage.getItem('bookr_token')
    const savedUser = localStorage.getItem('bookr_user')
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        api.setToken(token)
        setUser(userData)
      } catch (err) {
        console.error('Error loading user:', err)
        localStorage.removeItem('bookr_token')
        localStorage.removeItem('bookr_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password)
      setUser(data.user)
      localStorage.setItem('bookr_user', JSON.stringify(data.user))
      return data.user
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  const register = async (name, email, password) => {
    try {
      const data = await api.register(email, password, name)
      setUser(data.user)
      localStorage.setItem('bookr_user', JSON.stringify(data.user))
      return data.user
    } catch (error) {
      throw new Error(error.message || 'Error al registrarse')
    }
  }

  const logout = () => {
    setUser(null)
    api.logout()
    localStorage.removeItem('bookr_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
