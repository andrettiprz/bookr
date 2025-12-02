import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay usuario en localStorage al cargar
  useEffect(() => {
    // Crear usuario demo si no existe
    const users = JSON.parse(localStorage.getItem('bookr_users') || '[]');
    if (!users.find(u => u.email === 'demo@bookr.com')) {
      users.push({
        id: 'demo-user-id',
        name: 'Usuario Demo',
        email: 'demo@bookr.com',
        password: 'demo123',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('bookr_users', JSON.stringify(users));
    }

    const storedUser = localStorage.getItem('bookr_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('bookr_user');
      }
    }
    setLoading(false);
  }, []);

  // Registrar nuevo usuario
  const register = async (userData) => {
    try {
      // Llamar a la API
      const api = (await import('../services/api')).default;
      const result = await api.register(userData.email, userData.password, userData.name);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      
      return { success: false, error: 'Error al crear la cuenta' };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      // Llamar a la API
      const api = (await import('../services/api')).default;
      const result = await api.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      
      return { success: false, error: 'Credenciales inválidas' };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('bookr_user');
    setUser(null);
  };

  // Actualizar perfil
  const updateProfile = async (updates) => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }
    
    try {
      const users = JSON.parse(localStorage.getItem('bookr_users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }

      // Actualizar datos
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('bookr_users', JSON.stringify(users));

      // Actualizar sesión
      const updatedSession = {
        id: user.id,
        name: updates.name || user.name,
        email: updates.email || user.email
      };
      
      localStorage.setItem('bookr_user', JSON.stringify(updatedSession));
      setUser(updatedSession);

      return { success: true };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

