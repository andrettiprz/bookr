import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: 'white',
          fontSize: '1.5rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <div>Cargando...</div>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

