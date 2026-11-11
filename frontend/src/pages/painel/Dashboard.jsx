import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './Dashboard.css';

export default function Dashboard() {
  const { marca } = useAuth();
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/produtos'), api.get('/tecidos')]).then(([p, t]) => {
      const produtos = p.data;
      setResumo({
        totalProdutos: produtos.length,
        publicados: produtos.filter((x) => x.publicado).length,
        totalTecidos: t.data.length,
        custoMedio: produtos.length
          ? produtos.reduce((a, x) => a + Number(x.custoTotal || 0), 0) / produtos.length
          : 0,
      });
    }).finally(() => setCarregando(false));
  }, []);

  if (carregando) return <div className="centralizado"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dash-header">
        <h1 className="dash-titulo">{marca?.nome}</h1>
        <p className="dash-sub">Visão geral da marca</p>
      </div>

      <div className="metricas-grid">
        <Link to="/painel/produtos" className="metrica-card">
          <div className="metrica-top">
            <span className="metrica-label-top">Produtos</span>
            <span className="metrica-seta">→</span>
          </div>
          <div className="metrica-valor">{resumo.totalProdutos}</div>
          <div className="metrica-label">cadastrados</div>
        </Link>

        <Link to="/painel/produtos" className="metrica-card">
          <div className="metrica-top">
            <span className="metrica-label-top">Publicados</span>
            <span className="metrica-seta">→</span>
          </div>
          <div className="metrica-valor">{resumo.publicados}</div>
          <div className="metrica-label">na vitrine</div>
        </Link>

        <Link to="/painel/tecidos" className="metrica-card">
          <div className="metrica-top">
            <span className="metrica-label-top">Tecidos</span>
            <span className="metrica-seta">→</span>
          </div>
          <div className="metrica-valor">{resumo.totalTecidos}</div>
          <div className="metrica-label">no catálogo</div>
        </Link>

        <Link to="/painel/precificacao" className="metrica-card">
          <div className="metrica-top">
            <span className="metrica-label-top">Custo médio</span>
            <span className="metrica-seta">→</span>
          </div>
          <div className="metrica-valor" style={{ fontSize: resumo.custoMedio >= 1000 ? '1.2rem' : undefined }}>
            R$ {resumo.custoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="metrica-label">por peça</div>
        </Link>
      </div>

      <div className="section-titulo">Ações rápidas</div>
      <div className="atalhos-grid">
        <Link to="/painel/produtos/novo" className="atalho-card">
          <div className="atalho-icone">+</div> Novo produto
        </Link>
        <Link to="/painel/tecidos/novo" className="atalho-card">
          <div className="atalho-icone">◎</div> Novo tecido
        </Link>
        <Link to="/painel/precificacao" className="atalho-card">
          <div className="atalho-icone">◇</div> Calcular preço
        </Link>
        <Link to="/painel/minha-marca" className="atalho-card">
          <div className="atalho-icone">◉</div> Editar marca
        </Link>
        <Link to="/" target="_blank" className="atalho-card">
          <div className="atalho-icone">↗</div> Ver vitrine
        </Link>
      </div>
    </div>
  );
}
