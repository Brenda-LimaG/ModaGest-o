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
      setErro(err.response?.data?.erro || 'Credenciais inválidas.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-pagina">
      {/* Visual */}
      <div className="auth-visual">
        <div className="auth-visual-bg">MG</div>
        <div className="auth-visual-content">
          <span className="auth-visual-tag">Moda Gestão — Painel</span>
          <h2 className="auth-visual-title">Gerencie<br />sua marca</h2>
          <p className="auth-visual-desc">
            Organize produtos, controle tecidos e precifique cada peça com base no custo real.
          </p>
          <div className="auth-visual-pills">
            <span className="auth-pill">Vitrine pública</span>
            <span className="auth-pill">Catálogo de tecidos</span>
            <span className="auth-pill">Precificação</span>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="auth-form-side">
        <div className="auth-card">
          <Link to="/" className="auth-back">← Vitrine</Link>

          <div className="auth-cabecalho">
            <h1 className="auth-titulo">Entrar</h1>
            <p className="auth-subtitulo">Acesse o painel da sua marca</p>
          </div>

          {erro && <div className="alerta alerta-erro">{erro}</div>}

          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label>Email</label>
              <input
                type="email"
                placeholder="sua@marca.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
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
              {carregando
                ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#f5f2ed', borderColor: 'rgba(255,255,255,0.2)' }} /> Entrando…</>
                : 'Entrar →'}
            </button>
          </form>

          <p className="auth-link">
            Não tem conta? <Link to="/cadastro">Cadastre sua marca</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
