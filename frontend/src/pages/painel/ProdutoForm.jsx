import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import './Painel.css';

const UNIDADES = { metro: 'm', kg: 'kg', unidade: 'un' };

export default function ProdutoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [outrosCustos, setOutrosCustos] = useState('0');
  const [margemLucroPct, setMargemLucroPct] = useState('');
  const [fotos, setFotos] = useState([]);
  const [tecidosDisponiveis, setTecidosDisponiveis] = useState([]);
  const [tecidosSelecionados, setTecidosSelecionados] = useState([]);
  const [calculo, setCalculo] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/tecidos').then(({ data }) => setTecidosDisponiveis(data));
    if (id) {
      api.get(`/produtos/${id}`).then(({ data }) => {
        setNome(data.nome || '');
        setDescricao(data.descricao || '');
        setPrecoVenda(data.precoVenda ? String(data.precoVenda) : '');
        setOutrosCustos(String(data.outrosCustos || 0));
        setMargemLucroPct(data.margemLucroPct ? String(data.margemLucroPct) : '');
        setFotos(data.fotos || []);
        setTecidosSelecionados(
          (data.tecidosUsados || []).map((tu) => ({ tecidoId: tu.tecidoId, quantidade: String(tu.quantidade) }))
        );
      });
    }
  }, [id]);

  // Recalcula em tempo real
  useEffect(() => {
    const tecidosValidos = tecidosSelecionados.filter((t) => t.tecidoId && Number(t.quantidade) > 0);
    if (tecidosValidos.length === 0 && Number(outrosCustos) === 0) { setCalculo(null); return; }
    const margem = margemLucroPct !== '' ? Number(margemLucroPct) : null;
    api.post('/calculos/precificacao', {
      tecidosUtilizados: tecidosValidos,
      outrosCustos: Number(outrosCustos),
      margemLucroPct: margem,
    }).then(({ data }) => setCalculo(data)).catch(() => {});
  }, [tecidosSelecionados, outrosCustos, margemLucroPct]);

  function addTecido() {
    setTecidosSelecionados([...tecidosSelecionados, { tecidoId: '', quantidade: '' }]);
  }

  function updateTecido(i, campo, valor) {
    const novo = [...tecidosSelecionados];
    novo[i] = { ...novo[i], [campo]: valor };
    setTecidosSelecionados(novo);
  }

  function removerTecido(i) {
    setTecidosSelecionados(tecidosSelecionados.filter((_, idx) => idx !== i));
  }

  async function uploadFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setEnviandoFoto(true);
    const fd = new FormData();
    fd.append('imagem', file);
    try {
      const { data } = await api.post('/upload/imagem', fd);
      setFotos((f) => [...f, data.url]);
    } catch {
      setErro('Erro ao enviar foto.');
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    const payload = {
      nome, descricao, fotos,
      precoVenda: precoVenda ? Number(precoVenda) : undefined,
      outrosCustos: Number(outrosCustos),
      margemLucroPct: margemLucroPct !== '' ? Number(margemLucroPct) : null,
      tecidosUtilizados: tecidosSelecionados.filter((t) => t.tecidoId && Number(t.quantidade) > 0).map((t) => ({ tecidoId: t.tecidoId, quantidade: Number(t.quantidade) })),
    };
    try {
      if (id) await api.put(`/produtos/${id}`, payload);
      else await api.post('/produtos', payload);
      navigate('/painel/produtos');
    } catch (err) {
      const erros = err.response?.data?.erros;
      if (erros?.length) setErro(erros.map((e) => e.msg).join(' | '));
      else setErro(err.response?.data?.erro || 'Erro ao salvar produto.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="painel-header">
        <h1 className="pagina-titulo">{id ? 'Editar Produto' : 'Novo Produto'}</h1>
        <Link to="/painel/produtos" className="btn-secundario">← Voltar</Link>
      </div>

      {erro && <div style={{ color: 'var(--cor-erro)', background: '#ffebee', padding: '0.7rem', borderRadius: 'var(--raio)', marginBottom: '1rem' }}>{erro}</div>}

      <form onSubmit={salvar} className="card form-painel">
        {/* Dados básicos */}
        <div className="campo">
          <label>Nome do Produto *</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: Vestido Floral Primavera" />
        </div>
        <div className="campo">
          <label>Descrição</label>
          <textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva o produto..." />
        </div>

        {/* Fotos */}
        <div className="campo">
          <label>Fotos do Produto</label>
          <div className="upload-area">
            {fotos.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={url} alt={`foto ${i}`} className="preview-foto" />
                <button type="button" onClick={() => setFotos(fotos.filter((_, idx) => idx !== i))}
                  style={{ position: 'absolute', top: -6, right: -6, background: 'var(--cor-erro)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', padding: 0 }}>✕</button>
              </div>
            ))}
            <button type="button" className="upload-btn" onClick={() => fileRef.current.click()} disabled={enviandoFoto}>
              {enviandoFoto ? 'Enviando...' : '📎 Adicionar Foto'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={uploadFoto} />
          </div>
        </div>

        {/* Tecidos */}
        <div className="secao-label">🧵 Tecidos Utilizados</div>
        <div className="tecidos-lista">
          {tecidosSelecionados.map((ts, i) => {
            const tec = tecidosDisponiveis.find((t) => t.id === ts.tecidoId);
            return (
              <div className="tecido-item" key={i}>
                <select value={ts.tecidoId} onChange={(e) => updateTecido(i, 'tecidoId', e.target.value)}>
                  <option value="">Selecione um tecido...</option>
                  {tecidosDisponiveis.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome} — R$ {Number(t.valorPorUnidade).toFixed(2)}/{UNIDADES[t.unidadeMedida]}</option>
                  ))}
                </select>
                <input
                  type="number" step="0.001" min="0.001"
                  placeholder={`Qtd. (${tec ? UNIDADES[tec.unidadeMedida] : 'm'})`}
                  value={ts.quantidade}
                  onChange={(e) => updateTecido(i, 'quantidade', e.target.value)}
                />
                <button type="button" className="btn-perigo btn-sm" onClick={() => removerTecido(i)}>✕</button>
              </div>
            );
          })}
        </div>
        <button type="button" className="btn-secundario btn-sm" onClick={addTecido}>+ Adicionar Tecido</button>

        {/* Custos e margem */}
        <div className="secao-label">💰 Custos e Precificação</div>
        <div className="grid-2">
          <div className="campo">
            <label>Outros Custos de Produção (R$)</label>
            <input type="number" step="0.01" min="0" value={outrosCustos} onChange={(e) => setOutrosCustos(e.target.value)} placeholder="Ex: 20.00" />
          </div>
          <div className="campo">
            <label>Margem de Lucro Desejada (%)</label>
            <input type="number" step="0.01" min="0" max="99.99" value={margemLucroPct} onChange={(e) => setMargemLucroPct(e.target.value)} placeholder="Ex: 40" />
          </div>
        </div>

        {/* Resumo do cálculo em tempo real */}
        {calculo && (
          <div className="custo-box">
            <h4>📊 Resumo de Custo</h4>
            <div className="custo-linha"><span>Custo dos Tecidos</span><span>R$ {calculo.custoTecidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
            <div className="custo-linha"><span>Outros Custos</span><span>R$ {calculo.outrosCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
            <div className="custo-linha destaque"><span>Custo Total</span><span>R$ {calculo.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
            {calculo.precoSugerido && (
              <div className="custo-linha destaque"><span>Preço Sugerido ({calculo.margemLucroPct}% margem)</span><span>R$ {calculo.precoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
            )}
          </div>
        )}

        <div className="campo" style={{ marginTop: '1rem' }}>
          <label>Preço de Venda Definido (R$)</label>
          <input type="number" step="0.01" min="0.01" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} placeholder="Opcional — defina o preço final de venda" />
        </div>

        <div className="form-acoes">
          <button type="submit" className="btn-primario" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar Produto'}</button>
          <Link to="/painel/produtos" className="btn-secundario">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
