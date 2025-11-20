import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de usuario desde localStorage
    const savedUser = localStorage.getItem('bookr_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Simulación de login - en producción esto sería una llamada API
    const mockUser = {
      id: '1',
      name: 'Juan Pérez',
      email: email,
      avatar: '👤'
    }
    setUser(mockUser)
    localStorage.setItem('bookr_user', JSON.stringify(mockUser))
    return Promise.resolve(mockUser)
  }

  const register = (name, email, password) => {
    // Simulación de registro
    const mockUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      avatar: '👤'
    }
    setUser(mockUser)
    localStorage.setItem('bookr_user', JSON.stringify(mockUser))
    return Promise.resolve(mockUser)
  }

  const logout = () => {
    setUser(null)
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

