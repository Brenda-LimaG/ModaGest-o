import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import './Painel.css';

const UNIDADES = { metro: 'm', kg: 'kg', unidade: 'un' };

export default function Precificacao() {
  const [tecidosDisponiveis, setTecidosDisponiveis] = useState([]);
  const [tecidosSelecionados, setTecidosSelecionados] = useState([{ tecidoId: '', quantidade: '' }]);
  const [outrosCustos, setOutrosCustos] = useState('0');
  const [margemLucroPct, setMargemLucroPct] = useState('40');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    api.get('/tecidos').then(({ data }) => setTecidosDisponiveis(data));
  }, []);

  function addTecido() {
    setTecidosSelecionados([...tecidosSelecionados, { tecidoId: '', quantidade: '' }]);
  }

  function updateTecido(i, campo, valor) {
    const novo = [...tecidosSelecionados];
    novo[i] = { ...novo[i], [campo]: valor };
    setTecidosSelecionados(novo);
  }

  function removerTecido(i) {
    if (tecidosSelecionados.length === 1) return;
    setTecidosSelecionados(tecidosSelecionados.filter((_, idx) => idx !== i));
  }

  async function calcular(e) {
    e.preventDefault();
    setErro('');
    setCalculando(true);
    const validos = tecidosSelecionados.filter((t) => t.tecidoId && Number(t.quantidade) > 0);
    try {
      const { data } = await api.post('/calculos/precificacao', {
        tecidosUtilizados: validos,
        outrosCustos: Number(outrosCustos),
        margemLucroPct: margemLucroPct !== '' ? Number(margemLucroPct) : null,
      });
      setResultado(data);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao calcular.');
    } finally {
      setCalculando(false);
    }
  }

  return (
    <div>
      <h1 className="pagina-titulo">Calculadora de Precificação</h1>
      <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: '1.5rem', fontSize: '0.93rem' }}>
        Calcule o custo de produção de uma peça e descubra um preço de venda baseado na margem de lucro desejada.
      </p>

      {erro && <div style={{ color: 'var(--cor-erro)', background: '#ffebee', padding: '0.7rem', borderRadius: 'var(--raio)', marginBottom: '1rem' }}>{erro}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <form onSubmit={calcular} className="card">
          <div className="secao-label">🧵 Tecidos Utilizados</div>

          <div className="tecidos-lista">
            {tecidosSelecionados.map((ts, i) => {
              const tec = tecidosDisponiveis.find((t) => t.id === ts.tecidoId);
              return (
                <div className="tecido-item" key={i}>
                  <select value={ts.tecidoId} onChange={(e) => updateTecido(i, 'tecidoId', e.target.value)}>
                    <option value="">Selecione um tecido...</option>
                    {tecidosDisponiveis.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} — R$ {Number(t.valorPorUnidade).toFixed(2)}/{UNIDADES[t.unidadeMedida]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number" step="0.001" min="0"
                    placeholder={`Qtd (${tec ? UNIDADES[tec.unidadeMedida] : 'm'})`}
                    value={ts.quantidade}
                    onChange={(e) => updateTecido(i, 'quantidade', e.target.value)}
                  />
                  <button type="button" className="btn-perigo btn-sm" onClick={() => removerTecido(i)}>✕</button>
                </div>
              );
            })}
          </div>
          <button type="button" className="btn-secundario btn-sm" style={{ marginBottom: '1.2rem' }} onClick={addTecido}>
            + Adicionar Tecido
          </button>

          {tecidosDisponiveis.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: 'var(--cor-texto-secundario)', marginBottom: '1rem' }}>
              ⚠️ Nenhum tecido cadastrado. <a href="/painel/tecidos/novo">Cadastre um tecido</a> primeiro.
            </p>
          )}

          <div className="secao-label">💰 Valores</div>
          <div className="grid-2">
            <div className="campo">
              <label>Outros Custos (R$)</label>
              <input type="number" step="0.01" min="0" value={outrosCustos} onChange={(e) => setOutrosCustos(e.target.value)} placeholder="Ex: 20.00" />
            </div>
            <div className="campo">
              <label>Margem de Lucro (%)</label>
              <input type="number" step="0.01" min="0" max="99.99" value={margemLucroPct} onChange={(e) => setMargemLucroPct(e.target.value)} placeholder="Ex: 40" />
            </div>
          </div>

          <button type="submit" className="btn-primario" disabled={calculando} style={{ width: '100%', marginTop: '0.5rem' }}>
            {calculando ? 'Calculando...' : '🧮 Calcular'}
          </button>
        </form>

        {/* Resultado */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--cor-primaria-escura)' }}>📊 Resultado</h3>
          {!resultado ? (
            <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.9rem' }}>Preencha os dados e clique em "Calcular" para ver o resultado.</p>
          ) : (
            <>
              {resultado.detalheTecidos.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--cor-texto-secundario)', marginBottom: '0.5rem' }}>DETALHAMENTO DE TECIDOS</div>
                  {resultado.detalheTecidos.map((d, i) => (
                    <div key={i} className="custo-linha">
                      <span>{d.nome} × {d.quantidade} {UNIDADES[d.unidadeMedida]}</span>
                      <span>R$ {d.custoCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background: '#fce4ec', borderRadius: 'var(--raio)', padding: '1rem' }}>
                <div className="custo-linha">
                  <span>Custo dos Tecidos</span>
                  <span>R$ {resultado.custoTecidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="custo-linha">
                  <span>Outros Custos</span>
                  <span>R$ {resultado.outrosCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="custo-linha destaque">
                  <span>Custo Total de Produção</span>
                  <span>R$ {resultado.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {resultado.precoSugerido !== null && (
                  <div style={{ marginTop: '1rem', background: '#fff', borderRadius: 'var(--raio)', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--cor-texto-secundario)', marginBottom: '0.2rem' }}>
                      PREÇO SUGERIDO com {resultado.margemLucroPct}% de margem
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--cor-primaria)' }}>
                      R$ {resultado.precoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cor-texto-secundario)', marginTop: '0.3rem' }}>
                      Fórmula: {resultado.custoTotal} ÷ (1 − {resultado.margemLucroPct / 100})
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: 'var(--raio)', fontSize: '0.83rem', color: 'var(--cor-texto-secundario)' }}>
        <strong>Como funciona o cálculo:</strong> Preço sugerido = Custo total ÷ (1 − Margem%). Exemplo: custo R$65 com margem 40% → R$65 ÷ 0,60 = R$108,33
      </div>
    </div>
  );
}
