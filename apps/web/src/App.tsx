import { Route, Routes } from 'react-router';
import { Catalogo } from './Catalogo';
import { PantallaIngreso } from './features/auth/PantallaIngreso';
import { PantallaRegistro } from './features/auth/PantallaRegistro';
import { RutaProtegida } from './features/auth/RutaProtegida';
import { useSesionRechazada } from './hooks/useSesionRechazada';

export default function App() {
  useSesionRechazada();

  return (
    <Routes>
      {/* Provisorio: "/" va a ser la pantalla de inicio del organizador. */}
      <Route
        path="/"
        element={
          <RutaProtegida>
            <Catalogo />
          </RutaProtegida>
        }
      />
      <Route path="/registro" element={<PantallaRegistro />} />
      <Route path="/ingresar" element={<PantallaIngreso />} />
    </Routes>
  );
}
