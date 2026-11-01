import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import './Painel.css';

export default function MinhaMarca() {
  const [form, setForm] = useState(null);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/auth/perfil').then(({ data }) => setForm(data));
  }, []);

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function uploadLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setEnviandoFoto(true);
    const fd = new FormData();
    fd.append('imagem', file);
    try {
      const { data } = await api.post('/upload/imagem', fd);
      setForm((f) => ({ ...f, logoUrl: data.url }));
    } catch {
      setErro('Erro ao enviar logo.');
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvar(e) {
    e.preventDefault();
    setErro(''); setSucesso('');
    setSalvando(true);
    try {
      await api.put('/marcas/minha-marca', form);
      setSucesso('Dados atualizados com sucesso!');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  if (!form) return <div className="centralizado"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="pagina-titulo">Minha Marca</h1>

      {sucesso && <div style={{ color: 'var(--cor-sucesso)', background: '#e8f5e9', padding: '0.7rem', borderRadius: 'var(--raio)', marginBottom: '1rem' }}>{sucesso}</div>}
      {erro && <div style={{ color: 'var(--cor-erro)', background: '#ffebee', padding: '0.7rem', borderRadius: 'var(--raio)', marginBottom: '1rem' }}>{erro}</div>}

      <form onSubmit={salvar} className="card form-painel">
        <div className="campo">
          <label>Logo da Marca</label>
          <div className="upload-area">
            {form.logoUrl
              ? <img src={form.logoUrl} alt="logo" className="preview-foto" style={{ width: 80, height: 80 }} />
              : <div style={{ width: 80, height: 80, background: '#fce4ec', borderRadius: 'var(--raio)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👗</div>
            }
            <button type="button" className="upload-btn" onClick={() => fileRef.current.click()} disabled={enviandoFoto}>
              {enviandoFoto ? 'Enviando...' : '📎 Alterar Logo'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={uploadLogo} />
          </div>
        </div>

        <div className="campo">
          <label>Nome da Marca *</label>
          <input name="nome" value={form.nome || ''} onChange={handle} required />
        </div>

        <div className="campo">
          <label>Email</label>
          <input value={form.email || ''} disabled style={{ opacity: 0.65 }} />
          <small style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.78rem' }}>O email não pode ser alterado.</small>
        </div>

        <div className="campo">
          <label>Descrição</label>
          <textarea name="descricao" rows={3} value={form.descricao || ''} onChange={handle} placeholder="Conte um pouco sobre sua marca..." />
        </div>

        <div className="grid-2">
          <div className="campo">
            <label>Telefone / WhatsApp</label>
            <input name="telefone" value={form.telefone || ''} onChange={handle} placeholder="(11) 99999-9999" />
          </div>
          <div className="campo">
            <label>Instagram</label>
            <input name="instagram" value={form.instagram || ''} onChange={handle} placeholder="@suamarca" />
          </div>
        </div>

        <div className="form-acoes">
          <button type="submit" className="btn-primario" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar Alterações'}</button>
        </div>
      </form>
    </div>
  );
}
