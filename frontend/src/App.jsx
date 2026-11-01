import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas públicas
import Vitrine from './pages/Vitrine';
import MarcaDetalhe from './pages/MarcaDetalhe';

// Auth
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';

// Painel
import Layout from './components/Layout';
import Dashboard from './pages/painel/Dashboard';
import MinhaMarca from './pages/painel/MinhaMarca';
import Produtos from './pages/painel/Produtos';
import ProdutoForm from './pages/painel/ProdutoForm';
import Tecidos from './pages/painel/Tecidos';
import TecidoForm from './pages/painel/TecidoForm';
import Precificacao from './pages/painel/Precificacao';

function Protegida({ children }) {
  const { marca } = useAuth();
  return marca ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Vitrine />} />
        <Route path="/marca/:id" element={<MarcaDetalhe />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Painel protegido */}
        <Route path="/painel" element={<Protegida><Layout /></Protegida>}>
          <Route index element={<Dashboard />} />
          <Route path="minha-marca" element={<MinhaMarca />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="produtos/novo" element={<ProdutoForm />} />
          <Route path="produtos/:id/editar" element={<ProdutoForm />} />
          <Route path="tecidos" element={<Tecidos />} />
          <Route path="tecidos/novo" element={<TecidoForm />} />
          <Route path="tecidos/:id/editar" element={<TecidoForm />} />
          <Route path="precificacao" element={<Precificacao />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
