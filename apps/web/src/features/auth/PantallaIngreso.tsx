import { Link, Navigate, useLocation } from 'react-router';
import { EncabezadoPublico } from '../../components/EncabezadoPublico';
import { Tarjeta } from '../../components/Tarjeta';
import { leerSesion } from '../../lib/sesion';
import { FormularioIngreso } from './FormularioIngreso';

// Ingreso al panel de la organización.
// Referencia: panel "Volver a entrar" de docs/pantallas/jugador/cuenta-e-ingreso.html
export function PantallaIngreso() {
  // useSesionRechazada deja esta marca al redirigir, para explicar por qué
  // la persona terminó acá sin haberlo pedido.
  const location = useLocation();
  const sesionVencida = (location.state as { sesionVencida?: boolean } | null)?.sesionVencida === true;

  // Quien ya tiene sesión no necesita esta pantalla.
  if (leerSesion()) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-fondo">
      <EncabezadoPublico>
        <p className="text-sm text-gris-500">
          ¿Todavía no tenés cuenta?{' '}
          <Link to="/registro" className="font-medium text-negro hover:text-gris-500">
            Registrar tu organización
          </Link>
        </p>
      </EncabezadoPublico>

      <main className="mx-auto flex max-w-[440px] flex-col gap-4 px-7 py-[30px]">
        <Tarjeta className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">Ingresar</h1>
            <p className="text-[15px] text-gris-500">
              {sesionVencida ? 'Tu sesión venció. Ingresá de nuevo para seguir.' : 'Entrá al panel de tu organización.'}
            </p>
          </div>
          <FormularioIngreso />
        </Tarjeta>

        <Tarjeta className="flex flex-col gap-[9px] p-[18px]">
          <h2 className="text-sm font-semibold">¿Sos jugador?</h2>
          <p className="text-sm leading-normal text-gris-500">
            Las cuentas de jugador se crean al inscribirse a un torneo, no antes. Pedile el link a tu organización.
          </p>
        </Tarjeta>
      </main>
    </div>
  );
}
