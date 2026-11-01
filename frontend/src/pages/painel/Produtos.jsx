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
    if (!window.confirm(`Excluir o produto "${nome}"?`)) return;
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
        <h1 className="pagina-titulo">Produtos</h1>
        <Link to="/painel/produtos/novo" className="btn-primario">+ Novo Produto</Link>
      </div>

      {produtos.length === 0
        ? <div className="lista-vazia">Nenhum produto cadastrado ainda. <Link to="/painel/produtos/novo">Criar o primeiro →</Link></div>
        : (
          <table>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Custo Total</th>
                <th>Preço Sugerido</th>
                <th>Preço de Venda</th>
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
                  <td><span className="nome-produto">{p.nome}</span></td>
                  <td>R$ {Number(p.custoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>{p.precoSugerido ? `R$ ${Number(p.precoSugerido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}</td>
                  <td>{p.precoVenda ? `R$ ${Number(p.precoVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}</td>
                  <td>
                    <span className={p.publicado ? 'badge-publicado' : 'badge-rascunho'}>
                      {p.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td>
                    <div className="acoes">
                      <button className="btn-secundario btn-sm" onClick={() => navigate(`/painel/produtos/${p.id}/editar`)}>Editar</button>
                      <button className="btn-secundario btn-sm" onClick={() => alternarPublicacao(p.id)}>
                        {p.publicado ? 'Ocultar' : 'Publicar'}
                      </button>
                      <button className="btn-perigo btn-sm" onClick={() => excluir(p.id, p.nome)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}
