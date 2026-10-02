import { Navigate, Route, Routes } from 'react-router';
import { Catalogo } from './Catalogo';
import { PantallaIngreso } from './features/auth/PantallaIngreso';
import { PantallaRegistro } from './features/auth/PantallaRegistro';
import { RutaProtegida } from './features/auth/RutaProtegida';
import { PantallaCircuito } from './features/organizaciones/PantallaCircuito';
import { useSesionRechazada } from './hooks/useSesionRechazada';

export default function App() {
  useSesionRechazada();

  return (
    <Routes>
      {/* Por ahora el inicio del panel es "Tu circuito". */}
      <Route path="/" element={<Navigate to="/circuito" replace />} />
      <Route
        path="/circuito"
        element={
          <RutaProtegida>
            <PantallaCircuito />
          </RutaProtegida>
        }
      />
      <Route path="/registro" element={<PantallaRegistro />} />
      <Route path="/ingresar" element={<PantallaIngreso />} />
      {/* Muestrario de componentes, para desarrollo. */}
      <Route path="/catalogo" element={<Catalogo />} />
    </Routes>
  );
}
