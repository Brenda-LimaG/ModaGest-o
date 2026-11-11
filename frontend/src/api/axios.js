import axios from 'axios';

// Em desenvolvimento o Vite faz proxy de /api → localhost:3001
// Em produção o Express serve tudo no mesmo domínio sem prefixo
const BASE = import.meta.env.DEV ? '/api' : '';

const api = axios.create({
  baseURL: BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('marca');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
