import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './Painel.css';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  function carregar() {
    api.get('/produtos').then(({ data }) => setProdutos(data)).finally(() => setCarregando(false));
  }
  useEffect(carregar, []);

  async function excluir(id, nome) {
    if (!window.confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    await api.delete(`/produtos/${id}`);
    carregar();
  }

  async function alternarPublicacao(id) {
    await api.put(`/produtos/${id}/publicar`);
    carregar();
  }

  if (carregando) return <div className="centralizado"><div className="spinner" /></div>;

  return (
    <div>
      <div className="painel-header">
        <div>
          <h1 className="pagina-titulo">Produtos</h1>
          <p className="pagina-subtitulo">{produtos.length} produto{produtos.length !== 1 ? 's' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/painel/produtos/novo" className="btn-primario">+ Novo produto</Link>
      </div>

      {produtos.length === 0 ? (
        <div className="lista-vazia">
          <div className="lista-vazia-icone">👔</div>
          <h3>Nenhum produto ainda</h3>
          <p>Crie seu primeiro produto e comece a montar sua coleção.</p>
          <Link to="/painel/produtos/novo" className="btn-primario btn-sm">Criar produto</Link>
        </div>
      ) : (
        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Produto</th>
                <th>Custo total</th>
                <th>Preço sugerido</th>
                <th>Preço de venda</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.fotos?.[0]
                      ? <img src={p.fotos[0]} alt={p.nome} className="foto-mini" />
                      : <div className="foto-mini-placeholder">👔</div>
                    }
                  </td>
                  <td>
                    <span className="nome-item">{p.nome}</span>
                    {p.descricao && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.15rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.descricao}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    R$ {Number(p.custoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ color: 'var(--brand)', fontWeight: 600 }}>
                    {p.precoSugerido ? `R$ ${Number(p.precoSugerido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td>
                    {p.precoVenda ? `R$ ${Number(p.precoVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge ${p.publicado ? 'badge-publicado' : 'badge-rascunho'}`}>
                      {p.publicado ? '● Publicado' : '○ Rascunho'}
                    </span>
                  </td>
                  <td>
                    <div className="acoes">
                      <button className="btn-secundario btn-sm" onClick={() => navigate(`/painel/produtos/${p.id}/editar`)}>Editar</button>
                      <button className="btn-ghost btn-sm" onClick={() => alternarPublicacao(p.id)}>
                        {p.publicado ? 'Ocultar' : 'Publicar'}
                      </button>
                      <button className="btn-perigo btn-sm" onClick={() => excluir(p.id, p.nome)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
