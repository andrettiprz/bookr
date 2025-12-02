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
      // Obtener usuarios existentes
      const users = JSON.parse(localStorage.getItem('bookr_users') || '[]');
      
      // Verificar si el email ya existe
      if (users.find(u => u.email === userData.email)) {
        throw new Error('Este email ya está registrado');
      }

      // Crear nuevo usuario
      const newUser = {
        id: crypto.randomUUID(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // En producción: hashear con bcrypt
        createdAt: new Date().toISOString()
      };

      // Guardar en la lista de usuarios
      users.push(newUser);
      localStorage.setItem('bookr_users', JSON.stringify(users));

      // Crear objeto de sesión (sin password)
      const userSession = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      };

      // Guardar sesión
      localStorage.setItem('bookr_user', JSON.stringify(userSession));
      setUser(userSession);

      return { success: true, user: userSession };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      // Obtener usuarios
      const users = JSON.parse(localStorage.getItem('bookr_users') || '[]');
      
      // Buscar usuario
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña
      if (user.password !== password) {
        throw new Error('Contraseña incorrecta');
      }

      // Crear sesión
      const userSession = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      localStorage.setItem('bookr_user', JSON.stringify(userSession));
      setUser(userSession);

      return { success: true, user: userSession };
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

