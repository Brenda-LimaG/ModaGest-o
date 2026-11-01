import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { marca, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${menuAberto ? 'aberta' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icone">👗</span>
          <span className="logo-texto">Moda Gestão</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/painel" end>📊 Dashboard</NavLink>
          <NavLink to="/painel/produtos">👔 Produtos</NavLink>
          <NavLink to="/painel/tecidos">🧵 Tecidos</NavLink>
          <NavLink to="/painel/precificacao">💰 Precificação</NavLink>
          <NavLink to="/painel/minha-marca">🏷️ Minha Marca</NavLink>
          <NavLink to="/" target="_blank">🌐 Ver Vitrine</NavLink>
        </nav>

        <div className="sidebar-usuario">
          <span className="usuario-nome">{marca?.nome}</span>
          <button className="btn-secundario btn-sm" onClick={handleLogout}>Sair</button>
        </div>
      </aside>

      <div className="conteudo-principal">
        <header className="topbar">
          <button className="btn-menu" onClick={() => setMenuAberto(!menuAberto)}>☰</button>
          <span className="topbar-titulo">Painel Administrativo</span>
        </header>
        <main className="main-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
