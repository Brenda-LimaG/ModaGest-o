import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { marca, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  function handleLogout() { logout(); navigate('/login'); }
  function fecharMenu() { setMenuAberto(false); }

  const inicial = marca?.nome?.[0]?.toUpperCase() || '?';

  return (
    <div className="layout">
      <div className={`sidebar-overlay ${menuAberto ? 'visivel' : ''}`} onClick={fecharMenu} />

      <aside className={`sidebar ${menuAberto ? 'aberta' : ''}`}>
        <div className="sidebar-logo">
          <div>
            <div className="logo-marca">Moda Gestão</div>
            <div className="logo-sub">painel da marca</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-grupo-label">Início</span>
          <NavLink to="/painel" end onClick={fecharMenu}>
            <i className="nav-icon">▦</i> Dashboard
          </NavLink>

          <span className="nav-grupo-label">Catálogo</span>
          <NavLink to="/painel/produtos" onClick={fecharMenu}>
            <i className="nav-icon">◈</i> Produtos
          </NavLink>
          <NavLink to="/painel/tecidos" onClick={fecharMenu}>
            <i className="nav-icon">◎</i> Tecidos
          </NavLink>

          <span className="nav-grupo-label">Financeiro</span>
          <NavLink to="/painel/precificacao" onClick={fecharMenu}>
            <i className="nav-icon">◇</i> Precificação
          </NavLink>

          <span className="nav-grupo-label">Conta</span>
          <NavLink to="/painel/minha-marca" onClick={fecharMenu}>
            <i className="nav-icon">◉</i> Minha Marca
          </NavLink>
        </nav>

        <div className="sidebar-usuario">
          <div className="usuario-card">
            <div className="usuario-avatar">{inicial}</div>
            <div className="usuario-info">
              <div className="usuario-nome">{marca?.nome}</div>
              <div className="usuario-role">Marca</div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Sair">↪</button>
          </div>
        </div>
      </aside>

      <div className="conteudo-principal">
        <header className="topbar">
          <button className="btn-menu" onClick={() => setMenuAberto(!menuAberto)}>☰</button>
          <div className="topbar-esquerda">
            <span className="topbar-breadcrumb">Painel</span>
          </div>
          <Link to="/" target="_blank" className="topbar-vitrine">
            ↗ Ver vitrine
          </Link>
        </header>
        <main className="main-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
