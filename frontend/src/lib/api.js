const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('tmm_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('tmm_token', token);
    } else {
      localStorage.removeItem('tmm_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('tmm_token');
  }

  async request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        return null;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  get(path) {
    return this.request(path);
  }

  post(path, body) {
    return this.request(path, { method: 'POST', body: JSON.stringify(body) });
  }

  put(path, body) {
    return this.request(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
