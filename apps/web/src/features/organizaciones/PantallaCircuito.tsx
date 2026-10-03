import { useState } from 'react';
import { configuracionCircuitoSchema, type Circuito, type ConfiguracionCircuito } from '@setpoint/shared';
import { EncabezadoOrganizador } from '../../components/EncabezadoOrganizador';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { useGuardadoAutomatico, type EstadoGuardado } from '../../hooks/useGuardadoAutomatico';
import { guardarSesion, leerSesion } from '../../lib/sesion';
import { useCircuito, useGuardarCircuito } from './circuito.api';
import { ResumenCircuito } from './ResumenCircuito';
import { SeccionCategorias } from './SeccionCategorias';
import { SeccionDatos } from './SeccionDatos';
import { SeccionPuntos } from './SeccionPuntos';
import { SeccionRanking } from './SeccionRanking';

const textoDeEstado: Record<EstadoGuardado, string> = {
  'al-dia': 'configuración · se guarda solo',
  guardando: 'guardando…',
  guardado: 'guardado',
  invalido: 'hay un dato para revisar',
  error: 'no se pudo guardar',
};

// F01 — Tu circuito. Referencia: docs/pantallas/organizador/tu-circuito.html
// Se llega siempre con sesión: la ruta está envuelta en RutaProtegida.
export function PantallaCircuito() {
  const sesion = leerSesion()!;
  const circuito = useCircuito(sesion.organizacion.slug);

  if (circuito.isPending || circuito.isError) {
    return (
      <div className="min-h-screen bg-white">
        <EncabezadoOrganizador organizacion={sesion.organizacion.nombre} />
        <p className="px-7 py-8 text-[15px] text-gris-500" role={circuito.isError ? 'alert' : undefined}>
          {circuito.isError ? circuito.error.message : 'Cargando tu circuito…'}
        </p>
      </div>
    );
  }

  // El editor se monta recién cuando llegaron los datos: así su estado
  // arranca con ellos y no hace falta sincronizarlo después.
  return <EditorCircuito inicial={circuito.data} />;
}

function EditorCircuito({ inicial }: { inicial: Circuito }) {
  const { slug, jugadores } = inicial;

  const [config, setConfig] = useState<ConfiguracionCircuito>({
    nombre: inicial.nombre,
    contacto: inicial.contacto,
    usaRanking: inicial.usaRanking,
    categorias: inicial.categorias,
    etapas: inicial.etapas,
    puntajes: inicial.puntajes,
  });

  const cambiar = (cambios: Partial<ConfiguracionCircuito>) => setConfig((actual) => ({ ...actual, ...cambios }));

  const guardar = useGuardarCircuito(slug);
  const { estado, errores, reintentar } = useGuardadoAutomatico({
    valor: config,
    schema: configuracionCircuitoSchema,
    guardar: async (datos) => {
      const guardado = await guardar.mutateAsync(datos);
      // El nombre también vive en la sesión guardada (lo usa el encabezado
      // de las otras pantallas): se mantiene al día.
      const sesion = leerSesion();
      if (sesion) guardarSesion({ ...sesion, organizacion: { ...sesion.organizacion, nombre: guardado.nombre } });
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <EncabezadoOrganizador organizacion={config.nombre}>
        <Numero className="text-[13px] text-gris-400" aria-live="polite">
          {textoDeEstado[estado]}
        </Numero>
      </EncabezadoOrganizador>

      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-[7px] px-7 pt-[26px] pb-5">
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">Tu circuito</h1>
          <p className="text-[15px] text-gris-500">
            Podés crear un torneo sin configurar nada de esto. El ranking anual es opcional y lo activás cuando
            quieras.
          </p>
          {estado === 'error' && (
            <p role="alert" className="text-sm font-medium text-negro">
              No pudimos guardar los últimos cambios.{' '}
              <button type="button" onClick={() => void reintentar()} className="underline hover:text-gris-500">
                Reintentar
              </button>
            </p>
          )}
        </div>

        <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-4">
            <SeccionDatos
              nombre={config.nombre}
              contacto={config.contacto}
              slug={slug}
              errores={errores}
              onChange={cambiar}
            />
            <SeccionCategorias categorias={config.categorias} onChange={(categorias) => cambiar({ categorias })} />
            <SeccionRanking usaRanking={config.usaRanking} etapas={config.etapas} onChange={cambiar} />
            {config.usaRanking && (
              <SeccionPuntos puntajes={config.puntajes} onChange={(puntajes) => cambiar({ puntajes })} />
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <ResumenCircuito
              categorias={config.categorias.length}
              etapas={config.etapas.length}
              jugadores={jugadores}
              usaRanking={config.usaRanking}
            />
            <Tarjeta className="flex flex-col gap-[9px] bg-fondo p-[18px]">
              <h2 className="text-sm font-semibold">¿Solo querés probar?</h2>
              <p className="text-sm leading-normal text-gris-500">
                Apagá el ranking anual y creá un torneo suelto. Al terminar vas a tener la tabla de posiciones de ese
                torneo, sin acumular puntos.
              </p>
            </Tarjeta>
          </aside>
        </main>
      </div>
    </div>
  );
}
