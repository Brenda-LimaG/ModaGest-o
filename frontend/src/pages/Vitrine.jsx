import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Vitrine.css';

const UNIDADES = { metro: 'm', kg: 'kg', unidade: 'un' };

/* ── Modal de detalhe do produto ── */
function ModalProduto({ produto, onFechar }) {
  const { nome, descricao, fotos, precoVenda, marca, tecidosUsados } = produto;

  // Fecha com ESC
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onFechar(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFechar]);

  const inicial = marca?.nome?.[0]?.toUpperCase() || '?';

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Foto */}
        <div className="modal-foto">
          {fotos?.[0]
            ? <img src={fotos[0]} alt={nome} />
            : <div className="modal-foto-placeholder">👔</div>
          }
        </div>

        {/* Info */}
        <div className="modal-info">
          <button className="modal-fechar" onClick={onFechar}>✕</button>

          <div className="modal-tag">Peça</div>
          <h2 className="modal-nome">{nome}</h2>

          {descricao && <p className="modal-descricao">{descricao}</p>}

          {precoVenda && (
            <div className="modal-preco">
              R$ {Number(precoVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          )}

          {/* Tecidos */}
          {tecidosUsados?.length > 0 && (
            <>
              <div className="modal-divider" />
              <div className="modal-secao-titulo">Tecidos utilizados</div>
              <div className="modal-tecidos">
                {tecidosUsados.map((tu, i) => (
                  <span key={i} className="modal-tecido-tag">
                    {tu.tecido?.nome}
                    {tu.tecido?.tipo && ` · ${tu.tecido.tipo}`}
                    {tu.tecido?.cor && ` · ${tu.tecido.cor}`}
                    {` · ${Number(tu.quantidade)}${UNIDADES[tu.tecido?.unidadeMedida] || ''}`}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="modal-divider" />

          {/* Criador / Marca */}
          <div className="modal-secao-titulo">Criador</div>
          <Link to={`/marca/${marca?.id}`} className="modal-criador" onClick={onFechar}>
            <div className="modal-criador-avatar">
              {marca?.logoUrl ? <img src={marca.logoUrl} alt={marca.nome} /> : inicial}
            </div>
            <div className="modal-criador-info">
              <div className="modal-criador-nome">{marca?.nome}</div>
              <div className="modal-criador-sub">
                {marca?.instagram || 'Ver vitrine completa'}
              </div>
            </div>
            <span className="modal-criador-seta">→</span>
          </Link>

          {/* Ações */}
          <div className="modal-acoes">
            {marca?.telefone && (
              <a
                href={`https://wa.me/${marca.telefone.replace(/\D/g, '')}?text=Olá! Tenho interesse na peça: ${encodeURIComponent(nome)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-btn-wa"
              >
                Tenho interesse
              </a>
            )}
            <Link to={`/marca/${marca?.id}`} className="modal-btn-vitrine" onClick={onFechar}>
              Ver marca
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ── */
export default function Vitrine() {
  const [produtos, setProdutos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [produtoAberto, setProdutoAberto] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/vitrine/produtos'),
      api.get('/vitrine/marcas'),
    ]).then(([p, m]) => {
      setProdutos(p.data);
      setMarcas(m.data);
    }).finally(() => setCarregando(false));
  }, []);

  const fecharModal = useCallback(() => setProdutoAberto(null), []);

  const produtosFiltrados = busca.trim()
    ? produtos.filter((p) =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.marca?.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.tecidosUsados?.some((tu) => tu.tecido?.nome.toLowerCase().includes(busca.toLowerCase()))
      )
    : produtos;

  // Hero usa a primeira foto do primeiro produto publicado
  const heroProduto = produtos.find((p) => p.fotos?.[0]);
  const heroMarca = heroProduto?.marca;

  return (
    <div className="vitrine-pagina">
      {/* ── Nav ── */}
      <nav className="vitrine-nav">
        <Link to="/" className="vitrine-nav-logo">Moda Gestão</Link>
        <div className="vitrine-nav-links">
          <a href="#catalogo">Catálogo</a>
          <a href="#marcas">Marcas</a>
          <Link to="/cadastro">Cadastre-se</Link>
        </div>
        <div className="vitrine-nav-acoes">
          <Link to="/login" className="vitrine-nav-login">Entrar</Link>
          <Link to="/cadastro" className="vitrine-nav-cta">Sua marca aqui</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="vitrine-hero">
        {heroProduto?.fotos?.[0]
          ? <img src={heroProduto.fotos[0]} alt={heroProduto.nome} className="vitrine-hero-img" />
          : <div className="vitrine-hero-placeholder">👗</div>
        }
        <div className="vitrine-hero-content">
          <div className="vitrine-hero-marca-id">
            {heroMarca?.logoUrl && (
              <img
                src={heroMarca.logoUrl}
                alt={heroMarca.nome}
                className="vitrine-hero-logo"
              />
            )}
            <span className="vitrine-hero-tag">
              {heroMarca?.nome || 'Moda independente'}
            </span>
          </div>
          <h1 className="vitrine-hero-titulo">
            {heroMarca?.nome || 'New\nDrop'}
          </h1>
          <p className="vitrine-hero-sub">nova coleção</p>
          <a href="#catalogo" className="vitrine-hero-btn">Ver catálogo →</a>
        </div>
      </section>

      {/* ── Strip de avatares de marcas ── */}
      {marcas.length > 0 && (
        <div className="vitrine-marcas-strip" id="marcas">
          {marcas.map((m) => (
            <Link to={`/marca/${m.id}`} key={m.id} className="vitrine-marca-avatar-wrap">
              <div className="vitrine-marca-avatar">
                {m.logoUrl ? <img src={m.logoUrl} alt={m.nome} /> : m.nome[0]}
              </div>
              <span className="vitrine-marca-avatar-nome">{m.nome}</span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Busca ── */}
      <div className="vitrine-busca-wrap" style={{ paddingTop: '2.5rem' }}>
        <div className="vitrine-busca">
          <span className="vitrine-busca-icone">🔍</span>
          <input
            type="text"
            placeholder="Buscar peças, marcas ou tecidos…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* ── Grid de produtos ── */}
      <section className="vitrine-section" id="catalogo">
        <div className="vitrine-section-header">
          <h2 className="vitrine-section-titulo">New Drop</h2>
          <p className="vitrine-section-sub">
            {carregando ? 'carregando…' : `${produtosFiltrados.length} peça${produtosFiltrados.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {carregando && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
            <div className="spinner" style={{ borderTopColor: '#111', borderColor: '#ddd' }} />
          </div>
        )}

        {!carregando && produtosFiltrados.length === 0 && (
          <div className="vitrine-vazia">
            <p>{busca ? `Nenhum resultado para "${busca}"` : 'Nenhuma peça publicada ainda.'}</p>
            {!busca && <Link to="/cadastro" style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#111' }}>Cadastre sua marca →</Link>}
          </div>
        )}

        {!carregando && produtosFiltrados.length > 0 && (
          <div className="vitrine-grid">
            {produtosFiltrados.map((p) => (
              <div
                key={p.id}
                className="vitrine-grid-item"
                onClick={() => setProdutoAberto(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setProdutoAberto(p)}
                aria-label={`Ver detalhes de ${p.nome}`}
              >
                {p.fotos?.[0]
                  ? <img src={p.fotos[0]} alt={p.nome} loading="lazy" />
                  : <div className="vitrine-item-placeholder">👔</div>
                }
                <div className="vitrine-item-label">
                  <div>
                    <div className="vitrine-item-nome">{p.nome}</div>
                    <div className="vitrine-item-marca">{p.marca?.nome}</div>
                  </div>
                  <div className="vitrine-item-btn">+</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="vitrine-footer">
        <span className="vitrine-footer-logo">Moda Gestão</span>
        <Link to="/cadastro" className="vitrine-footer-link">Cadastrar minha marca →</Link>
      </footer>

      {/* ── Modal ── */}
      {produtoAberto && (
        <ModalProduto produto={produtoAberto} onFechar={fecharModal} />
      )}
    </div>
  );
}
