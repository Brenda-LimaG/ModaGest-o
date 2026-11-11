import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', descricao: '', telefone: '', instagram: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    if (form.senha.length < 8) { setErro('A senha deve ter no mínimo 8 caracteres.'); return; }
    setCarregando(true);
    try {
      await cadastrar(form);
      navigate('/painel');
    } catch (err) {
      const erros = err.response?.data?.erros;
      if (erros?.length) setErro(erros.map((e) => e.msg).join(' · '));
      else setErro(err.response?.data?.erro || 'Erro ao criar conta.');
    } finally { setCarregando(false); }
  }

  return (
    <div className="auth-pagina">
      {/* Visual */}
      <div className="auth-visual">
        <div className="auth-visual-bg">MG</div>
        <div className="auth-visual-content">
          <span className="auth-visual-tag">Moda Gestão — Nova marca</span>
          <h2 className="auth-visual-title">Sua marca<br />em destaque</h2>
          <p className="auth-visual-desc">
            Crie sua vitrine digital, organize sua coleção e descubra o preço certo para cada peça.
          </p>
          <div className="auth-visual-pills">
            <span className="auth-pill">Gratuito</span>
            <span className="auth-pill">Vitrine pública</span>
            <span className="auth-pill">Cálculo de custos</span>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="auth-form-side">
        <div className="auth-card">
          <Link to="/" className="auth-back">← Vitrine</Link>

          <div className="auth-cabecalho">
            <h1 className="auth-titulo">Criar conta</h1>
            <p className="auth-subtitulo">Cadastre sua marca gratuitamente</p>
          </div>

          {erro && <div className="alerta alerta-erro">{erro}</div>}

          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label>Nome da Marca *</label>
              <input name="nome" placeholder="Ex: Ateliê Flor de Liz" value={form.nome} onChange={handleChange} required autoFocus />
            </div>
            <div className="campo">
              <label>Email *</label>
              <input name="email" type="email" placeholder="contato@suamarca.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="campo">
              <label>Senha *</label>
              <input name="senha" type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={handleChange} required />
            </div>
            <div className="campo">
              <label>Descrição</label>
              <textarea name="descricao" rows={2} placeholder="Sobre sua marca…" value={form.descricao} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="campo">
                <label>WhatsApp</label>
                <input name="telefone" placeholder="(11) 99999-9999" value={form.telefone} onChange={handleChange} />
              </div>
              <div className="campo">
                <label>Instagram</label>
                <input name="instagram" placeholder="@suamarca" value={form.instagram} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" className="btn-primario auth-btn" disabled={carregando}>
              {carregando
                ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#f5f2ed', borderColor: 'rgba(255,255,255,0.2)' }} /> Criando…</>
                : 'Criar conta →'}
            </button>
          </form>

          <p className="auth-link">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
