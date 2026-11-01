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

  if (carregando) return <div className="centralizado"><div className="spinner" /></div>;
  if (erro) return <div className="detalhe-pagina"><div className="centralizado">{erro} <Link to="/">← Voltar</Link></div></div>;

  const { marca, produtos } = dados;

  return (
    <div className="detalhe-pagina">
      <div className="detalhe-topo">
        <Link to="/" className="detalhe-voltar">← Voltar à Vitrine</Link>
        <div className="detalhe-header card">
          <div className="detalhe-nome">{marca.nome}</div>
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
      </div>

      <div className="detalhe-produtos">
        <h2>Produtos ({produtos.length})</h2>

        {produtos.length === 0 && (
          <p className="sem-produtos">Nenhum produto publicado ainda.</p>
        )}

        <div className="grid-3">
          {produtos.map((p) => (
            <div key={p.id} className="produto-card card">
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
                    href={`https://wa.me/${marca.telefone.replace(/\D/g, '')}?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20produto%20${encodeURIComponent(p.nome)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-comprar"
                  >
                    💬 Tenho Interesse
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
