import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [marca, setMarca] = useState(() => {
    try { return JSON.parse(localStorage.getItem('marca')); } catch { return null; }
  });

  async function login(email, senha) {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('marca', JSON.stringify(data.marca));
    setMarca(data.marca);
  }

  async function cadastrar(dados) {
    const { data } = await api.post('/auth/cadastro', dados);
    localStorage.setItem('token', data.token);
    localStorage.setItem('marca', JSON.stringify(data.marca));
    setMarca(data.marca);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('marca');
    setMarca(null);
  }

  return (
    <AuthContext.Provider value={{ marca, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
