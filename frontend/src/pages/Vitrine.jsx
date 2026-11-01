import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Vitrine.css';

export default function Vitrine() {
  const [marcas, setMarcas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/vitrine/marcas').then(({ data }) => setMarcas(data)).finally(() => setCarregando(false));
  }, []);

  return (
    <div className="vitrine-pagina">
      <header className="vitrine-header">
        <div className="vitrine-header-conteudo">
          <h1>👗 Moda Gestão</h1>
          <p>Descubra marcas independentes de moda</p>
          <Link to="/login" className="btn-primario">Acessar Painel →</Link>
        </div>
      </header>

      <section className="vitrine-secao">
        <h2>Marcas em Destaque</h2>

        {carregando && <div className="centralizado"><div className="spinner" /></div>}

        {!carregando && marcas.length === 0 && (
          <div className="vitrine-vazia">
            <p>Nenhuma marca cadastrada ainda.</p>
            <Link to="/cadastro">Seja a primeira! →</Link>
          </div>
        )}

        <div className="marcas-grid">
          {marcas.map((marca) => (
            <Link to={`/marca/${marca.id}`} key={marca.id} className="marca-card">
              <div className="marca-logo">
                {marca.logoUrl
                  ? <img src={marca.logoUrl} alt={marca.nome} />
                  : <span className="marca-logo-placeholder">👗</span>
                }
              </div>
              <div className="marca-info">
                <h3>{marca.nome}</h3>
                {marca.descricao && <p>{marca.descricao}</p>}
                <span className="marca-produtos">
                  {marca._count?.produtos ?? 0} produto(s)
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="vitrine-footer">
        <p>Moda Gestão — Plataforma para pequenas marcas de moda 💕</p>
      </footer>
    </div>
  );
}
