import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import './MarcaDetalhe.css';

export default function MarcaDetalhe() {
  const { id } = useParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get(`/vitrine/marcas/${id}/produtos`)
      .then(({ data }) => setDados(data))
      .catch(() => setErro('Marca não encontrada.'))
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) return (
    <div className="detalhe-pagina">
      <div className="centralizado" style={{ minHeight: '100vh', background: '#0f0e17', color: 'rgba(255,255,255,0.4)' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (erro) return (
    <div className="detalhe-pagina">
      <div className="centralizado" style={{ minHeight: '100vh', background: '#0f0e17', color: 'rgba(255,255,255,0.4)', flexDirection: 'column', gap: '1rem' }}>
        <p>{erro}</p>
        <Link to="/" className="btn-primario">← Voltar à vitrine</Link>
      </div>
    </div>
  );

  const { marca, produtos } = dados;

  return (
    <div className="detalhe-pagina">
      {/* Nav */}
      <nav className="detalhe-nav">
        <Link to="/" className="detalhe-nav-logo">
          <div className="detalhe-nav-logo-icon">✦</div>
          Moda Gestão
        </Link>
        <Link to="/" className="detalhe-voltar">← Todas as marcas</Link>
      </nav>

      {/* Hero da marca */}
      <div className="detalhe-hero">
        <div className="detalhe-hero-bg" />
        <div className="detalhe-hero-avatar">
          {marca.logoUrl ? <img src={marca.logoUrl} alt={marca.nome} /> : '👗'}
        </div>
        <h1>{marca.nome}</h1>
        {marca.descricao && <p className="detalhe-hero-desc">{marca.descricao}</p>}
        <div className="detalhe-contatos">
          {marca.telefone && (
            <a href={`https://wa.me/${marca.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="contato-link">
              📱 {marca.telefone}
            </a>
          )}
          {marca.instagram && (
            <a href={`https://instagram.com/${marca.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="contato-link">
              📸 {marca.instagram}
            </a>
          )}
        </div>
      </div>

      {/* Produtos */}
      <div className="detalhe-produtos">
        <div className="detalhe-produtos-inner">
          <h2>Coleção · {produtos.length} peça{produtos.length !== 1 ? 's' : ''}</h2>

          {produtos.length === 0 ? (
            <div className="sem-produtos">
              <p>Nenhum produto publicado ainda.</p>
            </div>
          ) : (
            <div className="produtos-grid">
              {produtos.map((p) => (
                <div key={p.id} className="produto-card">
                  <div className="produto-foto">
                    {p.fotos?.[0]
                      ? <img src={p.fotos[0]} alt={p.nome} />
                      : <span className="foto-placeholder">👔</span>
                    }
                  </div>
                  <div className="produto-info">
                    <h3>{p.nome}</h3>
                    {p.descricao && <p className="produto-descricao">{p.descricao}</p>}
                    {p.precoVenda && (
                      <div className="produto-preco">
                        R$ {Number(p.precoVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                    {marca.telefone && (
                      <a
                        href={`https://wa.me/${marca.telefone.replace(/\D/g, '')}?text=Olá! Tenho interesse no produto: ${encodeURIComponent(p.nome)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-comprar"
                      >
                        💬 Tenho interesse
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="detalhe-footer">
        <p>Moda Gestão — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
