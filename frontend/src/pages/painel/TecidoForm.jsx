import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import './Painel.css';

const VAZIO = { nome: '', tipo: '', cor: '', textura: '', fotoUrl: '', quantidadeEstoque: '', unidadeMedida: 'metro', valorPorUnidade: '' };

export default function TecidoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (id) {
      api.get(`/tecidos/${id}`).then(({ data }) => setForm({ ...data, quantidadeEstoque: String(data.quantidadeEstoque), valorPorUnidade: String(data.valorPorUnidade) }));
    }
  }, [id]);

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function uploadFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setEnviandoFoto(true);
    const fd = new FormData();
    fd.append('imagem', file);
    try {
      const { data } = await api.post('/upload/imagem', fd);
      setForm((f) => ({ ...f, fotoUrl: data.url }));
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
    try {
      if (id) {
        await api.put(`/tecidos/${id}`, form);
      } else {
        await api.post('/tecidos', form);
      }
      navigate('/painel/tecidos');
    } catch (err) {
      const erros = err.response?.data?.erros;
      if (erros?.length) setErro(erros.map((e) => e.msg).join(' | '));
      else setErro(err.response?.data?.erro || 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="painel-header">
        <h1 className="pagina-titulo">{id ? 'Editar Tecido' : 'Novo Tecido'}</h1>
        <Link to="/painel/tecidos" className="btn-secundario">← Voltar</Link>
      </div>

      {erro && <div style={{ color: 'var(--cor-erro)', marginBottom: '1rem', padding: '0.7rem', background: '#ffebee', borderRadius: 'var(--raio)' }}>{erro}</div>}

      <form onSubmit={salvar} className="card form-painel">
        <div className="campo">
          <label>Nome do Tecido *</label>
          <input name="nome" value={form.nome} onChange={handle} required placeholder="Ex: Linho Branco" />
        </div>

        <div className="grid-2">
          <div className="campo">
            <label>Tipo</label>
            <input name="tipo" value={form.tipo} onChange={handle} placeholder="Ex: Algodão, Linho, Malha" />
          </div>
          <div className="campo">
            <label>Cor</label>
            <input name="cor" value={form.cor} onChange={handle} placeholder="Ex: Branco" />
          </div>
        </div>

        <div className="campo">
          <label>Textura</label>
          <input name="textura" value={form.textura} onChange={handle} placeholder="Ex: Lisa, Estampada, Canelada" />
        </div>

        <div className="grid-2">
          <div className="campo">
            <label>Unidade de Medida *</label>
            <select name="unidadeMedida" value={form.unidadeMedida} onChange={handle}>
              <option value="metro">Metro (m)</option>
              <option value="kg">Quilograma (kg)</option>
              <option value="unidade">Unidade</option>
            </select>
          </div>
          <div className="campo">
            <label>Valor por Unidade (R$) *</label>
            <input name="valorPorUnidade" type="number" step="0.01" min="0.01" value={form.valorPorUnidade} onChange={handle} required placeholder="Ex: 30.00" />
          </div>
        </div>

        <div className="campo">
          <label>Quantidade em Estoque</label>
          <input name="quantidadeEstoque" type="number" step="0.001" min="0" value={form.quantidadeEstoque} onChange={handle} placeholder="Ex: 15.5" />
        </div>

        <div className="campo">
          <label>Foto do Tecido</label>
          <div className="upload-area">
            {form.fotoUrl && <img src={form.fotoUrl} alt="tecido" className="preview-foto" />}
            <button type="button" className="upload-btn" onClick={() => fileRef.current.click()} disabled={enviandoFoto}>
              {enviandoFoto ? 'Enviando...' : '📎 Escolher Foto'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={uploadFoto} />
          </div>
        </div>

        <div className="form-acoes">
          <button type="submit" className="btn-primario" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar Tecido'}</button>
          <Link to="/painel/tecidos" className="btn-secundario">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
