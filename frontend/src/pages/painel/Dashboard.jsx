import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './Dashboard.css';

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/produtos'),
      api.get('/tecidos'),
    ]).then(([prod, tec]) => {
      const produtos = prod.data;
      const tecidos = tec.data;
      setResumo({
        totalProdutos: produtos.length,
        publicados: produtos.filter((p) => p.publicado).length,
        totalTecidos: tecidos.length,
        custoMedio: produtos.length
          ? (produtos.reduce((acc, p) => acc + Number(p.custoTotal || 0), 0) / produtos.length).toFixed(2)
          : 0,
      });
    }).finally(() => setCarregando(false));
  }, []);

  if (carregando) return <div className="centralizado"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <h1 className="pagina-titulo">Dashboard</h1>

      <div className="metricas-grid">
        <div className="metrica-card card">
          <div className="metrica-icone">👔</div>
          <div className="metrica-valor">{resumo.totalProdutos}</div>
          <div className="metrica-label">Produtos Cadastrados</div>
          <Link to="/painel/produtos" className="metrica-link">Gerenciar →</Link>
        </div>
        <div className="metrica-card card">
          <div className="metrica-icone">🌐</div>
          <div className="metrica-valor">{resumo.publicados}</div>
          <div className="metrica-label">Publicados na Vitrine</div>
          <Link to="/painel/produtos" className="metrica-link">Ver produtos →</Link>
        </div>
        <div className="metrica-card card">
          <div className="metrica-icone">🧵</div>
          <div className="metrica-valor">{resumo.totalTecidos}</div>
          <div className="metrica-label">Tecidos no Catálogo</div>
          <Link to="/painel/tecidos" className="metrica-link">Gerenciar →</Link>
        </div>
        <div className="metrica-card card">
          <div className="metrica-icone">💰</div>
          <div className="metrica-valor">R$ {Number(resumo.custoMedio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="metrica-label">Custo Médio por Peça</div>
          <Link to="/painel/precificacao" className="metrica-link">Calcular →</Link>
        </div>
      </div>

      <div className="atalhos-grid">
        <Link to="/painel/produtos/novo" className="atalho-card card">
          <span className="atalho-icone">➕</span>
          <span>Novo Produto</span>
        </Link>
        <Link to="/painel/tecidos/novo" className="atalho-card card">
          <span className="atalho-icone">🧵</span>
          <span>Cadastrar Tecido</span>
        </Link>
        <Link to="/painel/precificacao" className="atalho-card card">
          <span className="atalho-icone">🧮</span>
          <span>Calcular Preço</span>
        </Link>
        <Link to="/painel/minha-marca" className="atalho-card card">
          <span className="atalho-icone">🏷️</span>
          <span>Editar Marca</span>
        </Link>
      </div>
    </div>
  );
}
