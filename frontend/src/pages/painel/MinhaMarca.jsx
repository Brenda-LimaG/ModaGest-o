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

  function handle(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function uploadLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setEnviandoFoto(true);
    const fd = new FormData();
    fd.append('imagem', file);
    try {
      const { data } = await api.post('/upload/imagem', fd);
      setForm((f) => ({ ...f, logoUrl: data.url }));
    } catch { setErro('Erro ao enviar logo.'); }
    finally { setEnviandoFoto(false); }
  }

  async function salvar(e) {
    e.preventDefault();
    setErro(''); setSucesso('');
    setSalvando(true);
    try {
      await api.put('/marcas/minha-marca', form);
      setSucesso('Alterações salvas com sucesso!');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar.');
    } finally { setSalvando(false); }
  }

  if (!form) return <div className="centralizado"><div className="spinner" /></div>;

  return (
    <div>
      <div className="painel-header">
        <div>
          <h1 className="pagina-titulo">Minha Marca</h1>
          <p className="pagina-subtitulo">Informações públicas e de contato</p>
        </div>
      </div>

      {sucesso && <div className="alerta alerta-ok">✓ {sucesso}</div>}
      {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

      <form onSubmit={salvar} className="card form-painel">
        {/* Logo */}
        <div className="campo">
          <label>Logo da Marca</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: form.logoUrl ? 'transparent' : 'var(--brand-light)',
              border: '2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0, fontSize: '1.8rem'
            }}>
              {form.logoUrl ? <img src={form.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '✦'}
            </div>
            <div>
              <button type="button" className="btn-secundario btn-sm" onClick={() => fileRef.current.click()} disabled={enviandoFoto}>
                {enviandoFoto ? '↻ Enviando…' : '↑ Alterar logo'}
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>JPEG, PNG ou WebP · máx. 5 MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={uploadLogo} />
          </div>
        </div>

        <div className="campo">
          <label>Nome da Marca *</label>
          <input name="nome" value={form.nome || ''} onChange={handle} required />
        </div>

        <div className="campo">
          <label>Email <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-3)' }}>— não pode ser alterado</span></label>
          <input value={form.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
        </div>

        <div className="campo">
          <label>Descrição</label>
          <textarea name="descricao" rows={3} value={form.descricao || ''} onChange={handle} placeholder="Conte a história da sua marca…" />
        </div>

        <div className="grid-2">
          <div className="campo">
            <label>WhatsApp / Telefone</label>
            <input name="telefone" value={form.telefone || ''} onChange={handle} placeholder="(11) 99999-9999" />
          </div>
          <div className="campo">
            <label>Instagram</label>
            <input name="instagram" value={form.instagram || ''} onChange={handle} placeholder="@suamarca" />
          </div>
        </div>

        <div className="form-acoes">
          <button type="submit" className="btn-primario" disabled={salvando}>
            {salvando ? '↻ Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
