import { Route, Routes } from 'react-router';
import { Catalogo } from './Catalogo';
import { PantallaRegistro } from './features/auth/PantallaRegistro';

export default function App() {
  return (
    <Routes>
      {/* Provisorio: "/" va a ser la pantalla de inicio del organizador. */}
      <Route path="/" element={<Catalogo />} />
      <Route path="/registro" element={<PantallaRegistro />} />
    </Routes>
  );
}
