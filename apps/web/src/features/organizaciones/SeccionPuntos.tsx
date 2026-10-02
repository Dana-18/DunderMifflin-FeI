import { INSTANCIAS_CON_PUNTOS, type ConfiguracionCircuito, type InstanciaConPuntos } from '@setpoint/shared';
import { Campo } from '../../components/Campo';
import { Tarjeta } from '../../components/Tarjeta';

type Puntajes = ConfiguracionCircuito['puntajes'];

type Props = {
  puntajes: Puntajes;
  onChange: (puntajes: Puntajes) => void;
};

const rotulos: Record<InstanciaConPuntos, string> = {
  CAMPEON: 'Campeón',
  FINALISTA: 'Finalista',
  SEMIFINALISTA: 'Semifinalista',
  CUARTOS: 'Cuartos de final',
  OCTAVOS: 'Octavos de final',
  PARTICIPACION: 'Participación',
};

export function SeccionPuntos({ puntajes, onChange }: Props) {
  function cambiar(instancia: InstanciaConPuntos, texto: string) {
    // Se queda solo con los dígitos: no hay forma de escribir algo que no
    // sea un entero positivo. Vacío cuenta como 0.
    const puntos = Number(texto.replace(/\D/g, '').slice(0, 4));
    onChange({ ...puntajes, [instancia]: puntos });
  }

  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Puntos por instancia</h2>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        {INSTANCIAS_CON_PUNTOS.map((instancia) => (
          <Campo
            key={instancia}
            id={`circuito-puntos-${instancia.toLowerCase()}`}
            rotulo={rotulos[instancia]}
            numerico
            inputMode="numeric"
            value={String(puntajes[instancia])}
            onChange={(evento) => cambiar(instancia, evento.target.value)}
          />
        ))}
      </div>
      <p className="text-[13px] text-gris-500">
        Participación la recibe todo el que completa la fase de grupos sin clasificar a Campeonato.
      </p>
    </Tarjeta>
  );
}
