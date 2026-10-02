import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

const pasos = [
  { titulo: 'Elegís cómo arrancar', detalle: 'Un torneo suelto o un circuito con ranking' },
  { titulo: 'Cargás tus jugadores', detalle: 'De a uno o subiendo tu planilla' },
  { titulo: 'Publicás el primer torneo', detalle: 'Y compartís el link en tu grupo' },
];

// La tarjeta negra de la pantalla de registro: qué pasa después de crear la
// organización. El último paso va en lima porque es a donde se quiere llegar.
export function PasosSiguientes() {
  return (
    <Tarjeta variante="negra" className="flex flex-col gap-[15px]">
      <h2 className="text-[15px] font-semibold">Lo que sigue</h2>
      <ol className="flex flex-col gap-3.5">
        {pasos.map(({ titulo, detalle }, i) => {
          const esUltimo = i === pasos.length - 1;
          return (
            <li key={titulo} className="flex items-start gap-3">
              <Numero
                className={`flex size-[22px] shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  esUltimo ? 'bg-lima text-negro' : 'bg-borde-oscuro text-white'
                }`}
              >
                {i + 1}
              </Numero>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{titulo}</span>
                <span className="text-[13px] leading-[1.4] text-gris-400">{detalle}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </Tarjeta>
  );
}
