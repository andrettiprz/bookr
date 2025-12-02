// API Service - Vercel Backend con Postgres
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.user = null;
    this.loadUser();
  }

  loadUser() {
    const storedUser = localStorage.getItem('bookr_user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        console.error('Error loading user:', e);
        localStorage.removeItem('bookr_user');
      }
    }
  }

  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('bookr_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bookr_user');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.user?.id) {
      headers['x-user-id'] = this.user.id;
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

  // Auth
  async login(email, password) {
    const data = await this.request('/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    });
    
    if (data.success && data.user) {
      this.setUser(data.user);
    }
    
    return data;
  }

  async register(email, password, name) {
    const data = await this.request('/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'register', email, password, name }),
    });
    
    if (data.success && data.user) {
      this.setUser(data.user);
    }
    
    return data;
  }

  logout() {
    this.setUser(null);
  }

  // Reservations
  async getReservations() {
    if (!this.user) {
      throw new Error('Usuario no autenticado');
    }
    
    return this.request('/reservations', {
      method: 'GET',
    });
  }

  async createReservation(reservation) {
    if (!this.user) {
      throw new Error('Usuario no autenticado');
    }
    
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify({
        title: reservation.title,
        description: reservation.description,
        date: reservation.date,
        time: reservation.time,
        duration: reservation.duration || 60,
        location: reservation.location,
        status: reservation.status || 'Pendiente',
        color: reservation.color || '#3B82F6',
        imageUrl: reservation.imageUrl || '',
        attendees: reservation.attendees || []
      }),
    });
  }

  async updateReservation(id, updates) {
    if (!this.user) {
      throw new Error('Usuario no autenticado');
    }
    
    return this.request('/reservations', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  }

  async deleteReservation(id) {
    if (!this.user) {
      throw new Error('Usuario no autenticado');
    }
    
    return this.request(`/reservations?id=${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
