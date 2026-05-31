import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Avdelingsvalg from './pages/Avdelingsvalg';
import Pasientliste from './pages/Pasientliste';
import Pasientkort from './pages/Pasientkort';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/avdelingsvalg" element={<Avdelingsvalg />} />
        <Route path="/pasienter" element={<Pasientliste />} />
        <Route path="/pasient/:id" element={<Pasientkort />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
