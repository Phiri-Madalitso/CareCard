import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Avdelingsvalg from './pages/Avdelingsvalg';
import Pasientliste from './pages/Pasientliste';
import Pasientkort from './pages/Pasientkort';
import Godkjenning from './pages/Godkjenning';
import MineForslag from './pages/MineForslag';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/avdelingsvalg" element={
          <ProtectedRoute><Avdelingsvalg /></ProtectedRoute>
        } />
        <Route path="/pasienter" element={
          <ProtectedRoute><Pasientliste /></ProtectedRoute>
        } />
        <Route path="/pasient/:id" element={
          <ProtectedRoute><Pasientkort /></ProtectedRoute>
        } />
        <Route path="/godkjenning" element={
          <ProtectedRoute><Godkjenning /></ProtectedRoute>
        } />
        <Route path="/mine-forslag" element={
          <ProtectedRoute><MineForslag /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;