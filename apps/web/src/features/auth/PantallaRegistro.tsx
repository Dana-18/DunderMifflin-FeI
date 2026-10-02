import { Link } from 'react-router';
import { EncabezadoPublico } from '../../components/EncabezadoPublico';
import { Tarjeta } from '../../components/Tarjeta';
import { FormularioRegistro } from './FormularioRegistro';
import { PasosSiguientes } from './PasosSiguientes';

const aclaraciones = [
  {
    titulo: '¿Sos jugador?',
    texto:
      'No necesitás registrarte. Pedile el link del torneo a tu organización: te inscribís y pagás desde el teléfono.',
  },
  {
    titulo: '¿Ya tenés el ranking en un Excel?',
    texto: 'Subilo y se cargan todos los jugadores con sus puntos históricos, sin tipear nada.',
  },
];

// F01 — Registrar la organización. Referencia: docs/pantallas/organizador/registro.html
export function PantallaRegistro() {
  return (
    <div className="min-h-screen bg-fondo">
      <EncabezadoPublico>
        <p className="text-sm text-gris-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/ingresar" className="font-medium text-negro hover:text-gris-500">
            Ingresar
          </Link>
        </p>
      </EncabezadoPublico>

      <main className="mx-auto grid max-w-[870px] items-start gap-5 px-7 py-[30px] md:grid-cols-[minmax(0,1fr)_300px]">
        <Tarjeta className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">Registrar tu organización</h1>
            <p className="text-[15px] text-gris-500">
              Es gratis y no hace falta tarjeta. Después elegís si armás un circuito con ranking o un torneo suelto.
            </p>
          </div>
          <FormularioRegistro />
        </Tarjeta>

        <aside className="flex flex-col gap-4">
          <PasosSiguientes />
          {aclaraciones.map(({ titulo, texto }) => (
            <Tarjeta key={titulo} className="flex flex-col gap-[9px] p-[18px]">
              <h2 className="text-sm font-semibold">{titulo}</h2>
              <p className="text-sm leading-normal text-gris-500">{texto}</p>
            </Tarjeta>
          ))}
        </aside>
      </main>
    </div>
  );
}
