import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(form.email, form.senha);
      navigate('/painel');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-pagina">
      <div className="auth-card card">
        <div className="auth-logo">👗</div>
        <h1 className="auth-titulo">Moda Gestão</h1>
        <p className="auth-subtitulo">Entre na sua conta</p>

        {erro && <div className="auth-erro">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              placeholder="sua@marca.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primario auth-btn" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-link">
          Não tem conta? <Link to="/cadastro">Cadastre sua marca</Link>
        </p>
        <p className="auth-link">
          <Link to="/">← Ver vitrine pública</Link>
        </p>
      </div>
    </div>
  );
}
