import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import Button from '../components/Button'
import './Profile.css'

export default function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    // En producción, esto sería una llamada API
    alert('Perfil actualizado (simulación)')
    setIsEditing(false)
  }

  return (
    <div className="profile-page">
      <h1>Mi Perfil</h1>

      <div className="profile-content">
        <Card className="profile-card">
          <div className="profile-header">
            <div className="avatar-large">
              <span>{user?.avatar || '👤'}</span>
            </div>
            <h2>{user?.name}</h2>
            <p className="user-email">{user?.email}</p>
          </div>

          <div className="profile-section">
            <h3>Información Personal</h3>
            <div className="form-group">
              <label htmlFor="name">Nombre Completo</label>
              {isEditing ? (
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              ) : (
                <div className="field-value">{formData.name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                <div className="field-value">{formData.email}</div>
              )}
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    Guardar Cambios
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <h3>Estadísticas</h3>
          <div className="stats-list">
            <div className="stat-item">
              <span className="stat-icon">📅</span>
              <div>
                <div className="stat-value">Miembro desde</div>
                <div className="stat-label">Enero 2025</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔒</span>
              <div>
                <div className="stat-value">Cuenta</div>
                <div className="stat-label">Verificada</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

