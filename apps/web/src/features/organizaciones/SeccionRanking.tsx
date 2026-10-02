import { Interruptor } from '../../components/Interruptor';
import { ListaEditable } from '../../components/ListaEditable';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  usaRanking: boolean;
  etapas: string[];
  onChange: (cambios: { usaRanking?: boolean; etapas?: string[] }) => void;
};

export function SeccionRanking({ usaRanking, etapas, onChange }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-[5px]">
          <h2 className="text-[17px] font-semibold">Ranking anual</h2>
          <p className="text-sm text-gris-500">Los torneos acumulan puntos y arman una tabla que se actualiza sola.</p>
        </div>
        <Interruptor
          activo={usaRanking}
          onChange={(activo) => onChange({ usaRanking: activo })}
          etiqueta="Usar ranking anual"
        />
      </div>

      {/* Al apagar el ranking las etapas no se pierden: solo dejan de mostrarse. */}
      {usaRanking && (
        <>
          <div className="h-px bg-linea-suave" />
          <div className="flex flex-col gap-[11px]">
            <h3 className="text-[13px] font-semibold text-gris-500">Etapas del calendario</h3>
            <ListaEditable
              items={etapas}
              onChange={(nuevas) => onChange({ etapas: nuevas })}
              variante="numerada"
              singular="etapa"
              maximo={12}
            />
            <p className="text-[13px] text-gris-500">
              Cada etapa es un casillero del ranking. Cuando se juega Primavera 26, sus puntos reemplazan los de
              Primavera 25.
            </p>
          </div>
        </>
      )}
    </Tarjeta>
  );
}
