import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  categorias: number;
  etapas: number;
  jugadores: number;
  usaRanking: boolean;
};

function Fila({ rotulo, valor, destacado = false }: { rotulo: string; valor: number; destacado?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-gris-400">{rotulo}</span>
      <Numero className={`text-2xl font-medium tracking-[-0.02em] ${destacado ? 'text-lima' : 'text-white'}`}>
        {valor}
      </Numero>
    </div>
  );
}

// La tarjeta negra de la pantalla: el circuito en números, a medida que se edita.
export function ResumenCircuito({ categorias, etapas, jugadores, usaRanking }: Props) {
  return (
    <Tarjeta variante="negra" className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold">Cómo queda tu circuito</h2>
      <div className="flex flex-col gap-[13px]">
        <Fila rotulo="Categorías" valor={categorias} destacado />
        {usaRanking && (
          <>
            <div className="h-px bg-borde-oscuro" />
            <Fila rotulo="Etapas por año" valor={etapas} destacado />
          </>
        )}
        <div className="h-px bg-borde-oscuro" />
        <Fila rotulo="Jugadores" valor={jugadores} />
      </div>
      <p className="text-[13px] leading-[1.45] text-gris-400">
        {usaRanking
          ? 'El ranking empieza a moverse cuando cierres tu primer torneo.'
          : 'Sin ranking, cada torneo termina con su tabla de posiciones y no acumula puntos.'}
      </p>
    </Tarjeta>
  );
}
