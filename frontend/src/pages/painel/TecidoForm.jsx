import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import './Painel.css';

const VAZIO = {
  nome: '', tipo: '', cor: '', textura: '',
  fotoUrl: '', quantidadeEstoque: '0',
  unidadeMedida: 'metro', valorPorUnidade: '',
};

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
      api.get(`/tecidos/${id}`).then(({ data }) =>
        setForm({
          ...data,
          quantidadeEstoque: String(data.quantidadeEstoque ?? 0),
          valorPorUnidade: String(data.valorPorUnidade ?? ''),
          fotoUrl: data.fotoUrl ?? '',
          tipo: data.tipo ?? '',
          cor: data.cor ?? '',
          textura: data.textura ?? '',
        })
      );
    }
  }, [id]);

  function handle(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function uploadFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validação client-side
    const tiposOk = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposOk.includes(file.type)) {
      setErro('Formato inválido. Use JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErro('Imagem muito grande. Máximo 25 MB.');
      return;
    }

    setErro('');
    setEnviandoFoto(true);

    const fd = new FormData();
    fd.append('imagem', file);

    try {
      const { data } = await api.post('/upload/imagem', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, fotoUrl: data.url }));
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao enviar foto. Tente novamente.';
      setErro(msg);
    } finally {
      setEnviandoFoto(false);
      // Limpa o input para permitir reenvio do mesmo arquivo
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');

    // Validação client-side antes de enviar
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return; }
    if (!form.valorPorUnidade || Number(form.valorPorUnidade) <= 0) {
      setErro('Valor por unidade deve ser maior que zero.'); return;
    }

    setSalvando(true);

    // Converte strings para número antes de enviar
    const payload = {
      nome: form.nome.trim(),
      tipo: form.tipo.trim() || undefined,
      cor: form.cor.trim() || undefined,
      textura: form.textura.trim() || undefined,
      fotoUrl: form.fotoUrl || undefined,
      unidadeMedida: form.unidadeMedida,
      valorPorUnidade: Number(form.valorPorUnidade),
      quantidadeEstoque: Number(form.quantidadeEstoque) || 0,
    };

    try {
      if (id) await api.put(`/tecidos/${id}`, payload);
      else await api.post('/tecidos', payload);
      navigate('/painel/tecidos');
    } catch (err) {
      const erros = err.response?.data?.erros;
      if (erros?.length) setErro(erros.map((e) => e.msg).join(' · '));
      else setErro(err.response?.data?.erro || 'Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="painel-header">
        <div>
          <h1 className="pagina-titulo">{id ? 'Editar Tecido' : 'Novo Tecido'}</h1>
          <p className="pagina-subtitulo">
            {id ? 'Atualize as informações do tecido' : 'Adicione um tecido ao seu catálogo'}
          </p>
        </div>
        <Link to="/painel/tecidos" className="btn-secundario">← Voltar</Link>
      </div>

      {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

      <form onSubmit={salvar} className="card form-painel">
        <div className="campo">
          <label>Nome do Tecido *</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handle}
            required
            placeholder="Ex: Linho Branco Premium"
            autoFocus
          />
        </div>

        <div className="grid-2">
          <div className="campo">
            <label>Tipo</label>
            <input name="tipo" value={form.tipo} onChange={handle} placeholder="Ex: Algodão, Linho, Malha…" />
          </div>
          <div className="campo">
            <label>Cor</label>
            <input name="cor" value={form.cor} onChange={handle} placeholder="Ex: Branco, Azul…" />
          </div>
        </div>

        <div className="campo">
          <label>Textura</label>
          <input name="textura" value={form.textura} onChange={handle} placeholder="Ex: Lisa, Estampada, Canelada…" />
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
            <input
              name="valorPorUnidade"
              type="number"
              step="0.01"
              min="0.01"
              value={form.valorPorUnidade}
              onChange={handle}
              required
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="campo">
          <label>Quantidade em Estoque</label>
          <input
            name="quantidadeEstoque"
            type="number"
            step="0.001"
            min="0"
            value={form.quantidadeEstoque}
            onChange={handle}
            placeholder="0"
          />
        </div>

        {/* Upload de foto */}
        <div className="campo">
          <label>Foto do Tecido</label>
          <div className="upload-area">
            {form.fotoUrl && (
              <div style={{ position: 'relative' }}>
                <img src={form.fotoUrl} alt="tecido" className="preview-foto" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, fotoUrl: '' }))}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    background: 'var(--red)', color: '#fff',
                    border: 'none', borderRadius: '50%',
                    width: 18, height: 18, fontSize: 9,
                    cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Remover foto"
                >✕</button>
              </div>
            )}
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileRef.current?.click()}
              disabled={enviandoFoto}
            >
              {enviandoFoto
                ? <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Enviando…</>
                : '↑ Escolher foto'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={uploadFoto}
            />
            {!form.fotoUrl && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                JPEG, PNG ou WebP · máx. 5 MB
              </span>
            )}
          </div>
        </div>

        <div className="form-acoes">
          <button type="submit" className="btn-primario" disabled={salvando || enviandoFoto}>
            {salvando
              ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#f5f2ed', borderColor: 'rgba(255,255,255,0.2)' }} /> Salvando…</>
              : id ? 'Salvar alterações' : 'Cadastrar tecido'}
          </button>
          <Link to="/painel/tecidos" className="btn-secundario">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
