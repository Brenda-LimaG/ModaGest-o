import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', descricao: '', telefone: '', instagram: '',
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    if (form.senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    setCarregando(true);
    try {
      await cadastrar(form);
      navigate('/painel');
    } catch (err) {
      const erros = err.response?.data?.erros;
      if (erros?.length) setErro(erros.map((e) => e.msg).join(', '));
      else setErro(err.response?.data?.erro || 'Erro ao criar conta.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-pagina">
      <div className="auth-card card">
        <div className="auth-logo">👗</div>
        <h1 className="auth-titulo">Cadastre sua Marca</h1>
        <p className="auth-subtitulo">Crie sua conta gratuita</p>

        {erro && <div className="auth-erro">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label>Nome da Marca *</label>
            <input name="nome" placeholder="Ex: Ateliê Flor de Liz" value={form.nome} onChange={handleChange} required />
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
            <textarea name="descricao" rows={2} placeholder="Conte um pouco sobre sua marca..." value={form.descricao} onChange={handleChange} />
          </div>
          <div className="grid-2">
            <div className="campo">
              <label>Telefone / WhatsApp</label>
              <input name="telefone" placeholder="(11) 99999-9999" value={form.telefone} onChange={handleChange} />
            </div>
            <div className="campo">
              <label>Instagram</label>
              <input name="instagram" placeholder="@suamarca" value={form.instagram} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn-primario auth-btn" disabled={carregando}>
            {carregando ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p className="auth-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
