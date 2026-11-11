import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  function addTecido() { setTecidosSelecionados([...tecidosSelecionados, { tecidoId: '', quantidade: '' }]); }
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
    } finally { setCalculando(false); }
  }

  return (
    <div>
      <div className="painel-header">
        <div>
          <h1 className="pagina-titulo">Calculadora de Preço</h1>
          <p className="pagina-subtitulo">Calcule o custo de produção e o preço ideal para cada peça</p>
        </div>
      </div>

      {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

      {tecidosDisponiveis.length === 0 && (
        <div className="alerta alerta-aviso" style={{ marginBottom: '1.5rem' }}>
          ⚠ Você ainda não tem tecidos cadastrados. <Link to="/painel/tecidos/novo" style={{ fontWeight: 700 }}>Cadastre um tecido</Link> para usar a calculadora.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Formulário */}
        <form onSubmit={calcular} className="card">
          <div className="secao-label" style={{ marginTop: 0 }}>Tecidos utilizados</div>

          <div className="tecidos-lista">
            {tecidosSelecionados.map((ts, i) => {
              const tec = tecidosDisponiveis.find((t) => t.id === ts.tecidoId);
              return (
                <div className="tecido-item" key={i}>
                  <select value={ts.tecidoId} onChange={(e) => updateTecido(i, 'tecidoId', e.target.value)}>
                    <option value="">Selecione um tecido…</option>
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
                  <button type="button" className="btn-perigo btn-xs" onClick={() => removerTecido(i)}>✕</button>
                </div>
              );
            })}
          </div>
          <button type="button" className="btn-secundario btn-sm" style={{ marginBottom: '1.25rem' }} onClick={addTecido}>
            + Adicionar tecido
          </button>

          <div className="secao-label">Valores</div>
          <div className="grid-2">
            <div className="campo">
              <label>Outros custos (R$)</label>
              <input type="number" step="0.01" min="0" value={outrosCustos} onChange={(e) => setOutrosCustos(e.target.value)} placeholder="0,00" />
            </div>
            <div className="campo">
              <label>Margem de lucro (%)</label>
              <input type="number" step="0.01" min="0" max="99.99" value={margemLucroPct} onChange={(e) => setMargemLucroPct(e.target.value)} placeholder="40" />
            </div>
          </div>

          <button type="submit" className="btn-primario" disabled={calculando} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {calculando ? '↻ Calculando…' : 'Calcular preço'}
          </button>
        </form>

        {/* Resultado */}
        <div className="card" style={{ minHeight: 240 }}>
          {!resultado ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>◇</div>
              <p style={{ fontSize: '0.875rem' }}>Preencha os dados ao lado e clique em "Calcular preço"</p>
            </div>
          ) : (
            <>
              <div className="custo-box-titulo" style={{ marginBottom: '1rem' }}>Resultado do cálculo</div>

              {resultado.detalheTecidos.length > 0 && (
                <div style={{ marginBottom: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--r)', padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.6rem' }}>
                    Detalhamento de tecidos
                  </div>
                  {resultado.detalheTecidos.map((d, i) => (
                    <div key={i} className="custo-linha" style={{ fontSize: '0.82rem' }}>
                      <span>{d.nome} × {d.quantidade} {UNIDADES[d.unidadeMedida]}</span>
                      <span style={{ fontWeight: 600 }}>R$ {d.custoCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="custo-linha"><span>Custo dos tecidos</span><span>R$ {resultado.custoTecidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="custo-linha"><span>Outros custos</span><span>R$ {resultado.outrosCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="custo-linha destaque" style={{ marginBottom: '1rem' }}>
                <span>Custo total de produção</span>
                <span>R$ {resultado.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              {resultado.precoSugerido !== null && (
                <div className="custo-preco-sugerido">
                  <div>
                    <div className="custo-preco-label">Preço sugerido</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.1rem' }}>
                      com {resultado.margemLucroPct}% de margem
                    </div>
                  </div>
                  <div className="custo-preco-valor">
                    R$ {resultado.precoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.85rem', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                Fórmula: R$ {resultado.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ÷ (1 − {resultado.margemLucroPct || 0}/100)
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dica */}
      <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'var(--brand-light)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 'var(--r-lg)', fontSize: '0.82rem', color: 'var(--brand-dark)', display: 'flex', gap: '0.5rem' }}>
        <span>💡</span>
        <span><strong>Como funciona:</strong> Preço sugerido = Custo total ÷ (1 − Margem%). Exemplo: custo R$65 com margem 40% → R$65 ÷ 0,60 = R$108,33</span>
      </div>
    </div>
  );
}
