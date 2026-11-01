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
        <h1 className="pagina-titulo">Tecidos</h1>
        <Link to="/painel/tecidos/novo" className="btn-primario">+ Cadastrar Tecido</Link>
      </div>

      {tecidos.length === 0
        ? <div className="lista-vazia">Nenhum tecido cadastrado. <Link to="/painel/tecidos/novo">Cadastrar agora →</Link></div>
        : (
          <table>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Cor</th>
                <th>Estoque</th>
                <th>Valor / Un.</th>
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
                  <td><span className="nome-produto">{t.nome}</span></td>
                  <td>{t.tipo || '—'}</td>
                  <td>{t.cor || '—'}</td>
                  <td>{Number(t.quantidadeEstoque)} {UNIDADES[t.unidadeMedida]}</td>
                  <td>R$ {Number(t.valorPorUnidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/{UNIDADES[t.unidadeMedida]}</td>
                  <td>
                    <div className="acoes">
                      <button className="btn-secundario btn-sm" onClick={() => navigate(`/painel/tecidos/${t.id}/editar`)}>Editar</button>
                      <button className="btn-perigo btn-sm" onClick={() => excluir(t.id, t.nome)}>Excluir</button>
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
