// API Service - Vercel Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_LOCAL_MODE = true; // Modo Local activado - Vercel Functions disponibles como fallback
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'; // ID fijo para demo sin auth

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('bookr_token');
    this.localMode = USE_LOCAL_MODE;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('bookr_token', token);
    } else {
      localStorage.removeItem('bookr_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth - Local Mode
  async login(email, password) {
    if (this.localMode) {
      // Modo local con localStorage
      const users = JSON.parse(localStorage.getItem('bookr_users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (!user || user.password !== password) {
        throw new Error('Credenciales inválidas');
      }
      
      const token = `local_token_${Date.now()}`;
      this.setToken(token);
      
      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      };
    }
    
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(email, password, name) {
    if (this.localMode) {
      // Modo local con localStorage
      const users = JSON.parse(localStorage.getItem('bookr_users') || '[]');
      
      // Verificar si el email ya existe
      if (users.find(u => u.email === email)) {
        throw new Error('El email ya está registrado');
      }
      
      // Crear nuevo usuario
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password, // En producción esto debería estar hasheado
        avatar: name.charAt(0).toUpperCase(),
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('bookr_users', JSON.stringify(users));
      
      const token = `local_token_${Date.now()}`;
      this.setToken(token);
      
      return {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar
        }
      };
    }
    
    const data = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  logout() {
    this.setToken(null);
  }

  // Reservations
  async getReservations() {
    if (this.localMode) {
      const reservations = JSON.parse(localStorage.getItem('bookr_reservations') || '[]');
      return { reservations };
    }
    
    return this.request('/reservations', {
      method: 'GET',
    });
  }

  async createReservation(reservation) {
    if (this.localMode) {
      const reservations = JSON.parse(localStorage.getItem('bookr_reservations') || '[]');
      const newReservation = {
        Id: `res_${Date.now()}`,
        Title: reservation.title,
        Description: reservation.description,
        Date: reservation.date,
        Time: reservation.time,
        Duration: reservation.duration || 60,
        Location: reservation.location,
        Status: reservation.status || 'pending',
        Color: reservation.color || '#5B7FFF',
        ImageUrl: reservation.imageUrl || '',
        Category: reservation.category || '',
        CreatedAt: new Date().toISOString(),
        attendees: reservation.attendees || []
      };
      
      reservations.push(newReservation);
      localStorage.setItem('bookr_reservations', JSON.stringify(reservations));
      
      return { reservation: newReservation };
    }
    
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
  }

  async updateReservation(id, updates) {
    if (this.localMode) {
      const reservations = JSON.parse(localStorage.getItem('bookr_reservations') || '[]');
      const index = reservations.findIndex(r => r.Id === id);
      
      if (index === -1) {
        throw new Error('Reserva no encontrada');
      }
      
      reservations[index] = { ...reservations[index], ...updates };
      localStorage.setItem('bookr_reservations', JSON.stringify(reservations));
      
      return { reservation: reservations[index] };
    }
    
    return this.request(`/reservations?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteReservation(id) {
    if (this.localMode) {
      const reservations = JSON.parse(localStorage.getItem('bookr_reservations') || '[]');
      const filtered = reservations.filter(r => r.Id !== id);
      localStorage.setItem('bookr_reservations', JSON.stringify(filtered));
      
      return { success: true };
    }
    
    return this.request(`/reservations?id=${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();

