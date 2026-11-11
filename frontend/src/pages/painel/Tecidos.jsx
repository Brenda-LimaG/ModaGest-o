import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './Painel.css';

const UNIDADES = { metro: 'm', kg: 'kg', unidade: 'un' };

export default function Tecidos() {
  const [tecidos, setTecidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  function carregar() {
    api.get('/tecidos').then(({ data }) => setTecidos(data)).finally(() => setCarregando(false));
  }
  useEffect(carregar, []);

  async function excluir(id, nome) {
    if (!window.confirm(`Excluir o tecido "${nome}"?`)) return;
    await api.delete(`/tecidos/${id}`);
    carregar();
  }

  if (carregando) return <div className="centralizado"><div className="spinner" /></div>;

  return (
    <div>
      <div className="painel-header">
        <div>
          <h1 className="pagina-titulo">Tecidos</h1>
          <p className="pagina-subtitulo">{tecidos.length} tecido{tecidos.length !== 1 ? 's' : ''} no catálogo</p>
        </div>
        <Link to="/painel/tecidos/novo" className="btn-primario">+ Novo tecido</Link>
      </div>

      {tecidos.length === 0 ? (
        <div className="lista-vazia">
          <div className="lista-vazia-icone">🧵</div>
          <h3>Nenhum tecido ainda</h3>
          <p>Cadastre os tecidos que você usa para calcular os custos dos seus produtos.</p>
          <Link to="/painel/tecidos/novo" className="btn-primario btn-sm">Cadastrar tecido</Link>
        </div>
      ) : (
        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Cor</th>
                <th>Estoque</th>
                <th>Valor / unidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tecidos.map((t) => (
                <tr key={t.id}>
                  <td>
                    {t.fotoUrl
                      ? <img src={t.fotoUrl} alt={t.nome} className="foto-mini" />
                      : <div className="foto-mini-placeholder">🧵</div>
                    }
                  </td>
                  <td><span className="nome-item">{t.nome}</span></td>
                  <td>
                    {t.tipo ? <span className="tag">{t.tipo}</span> : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td>
                    {t.cor
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.cor, border: '1px solid var(--border)' }} />
                          {t.cor}
                        </div>
                      : <span style={{ color: 'var(--text-3)' }}>—</span>
                    }
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {Number(t.quantidadeEstoque).toLocaleString('pt-BR')} {UNIDADES[t.unidadeMedida]}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--brand)' }}>
                    R$ {Number(t.valorPorUnidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/{UNIDADES[t.unidadeMedida]}
                  </td>
                  <td>
                    <div className="acoes">
                      <button className="btn-secundario btn-sm" onClick={() => navigate(`/painel/tecidos/${t.id}/editar`)}>Editar</button>
                      <button className="btn-perigo btn-sm" onClick={() => excluir(t.id, t.nome)}>✕</button>
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
