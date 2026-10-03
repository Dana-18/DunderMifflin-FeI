import { useState, type KeyboardEvent } from 'react';
import { Numero } from './Numero';

type Props = {
  items: string[];
  onChange: (items: string[]) => void;
  /** 'oscura': chips negros. 'numerada': chips grises con su posición adelante. */
  variante: 'oscura' | 'numerada';
  /** Para los textos de accesibilidad: "categoría", "etapa". */
  singular: string;
  maximo?: number;
};

const base = 'inline-flex h-9 items-center gap-[9px] rounded-full border px-3.5 text-sm font-medium';

const estilos = {
  oscura: 'border-negro bg-negro text-white',
  numerada: 'border-linea bg-fondo text-negro',
};

// Lista de nombres como chips: se quitan con la cruz y se agregan escribiendo
// en el último chip. No tiene lógica de dominio: sirve para categorías,
// etapas o cualquier lista corta de textos.
export function ListaEditable({ items, onChange, variante, singular, maximo = 20 }: Props) {
  const [agregando, setAgregando] = useState(false);
  const [texto, setTexto] = useState('');

  function confirmar() {
    const nombre = texto.trim();
    const repetido = items.some((item) => item.toLowerCase() === nombre.toLowerCase());
    // Vacío o repetido no se agrega: se cierra sin hacer nada.
    if (nombre && !repetido) onChange([...items, nombre]);
    setTexto('');
    setAgregando(false);
  }

  function alTeclear(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      confirmar();
    }
    if (evento.key === 'Escape') {
      setTexto('');
      setAgregando(false);
    }
  }

  return (
    <ul className="flex flex-wrap items-center gap-[9px]">
      {items.map((item, i) => (
        <li key={item} className={`${base} ${estilos[variante]}`}>
          {variante === 'numerada' && <Numero className="text-xs text-gris-500">{i + 1}</Numero>}
          <span>{item}</span>
          <button
            type="button"
            aria-label={`Quitar ${singular} ${item}`}
            onClick={() => onChange(items.filter((otro) => otro !== item))}
            className={variante === 'oscura' ? 'text-gris-400 hover:text-white' : 'text-gris-400 hover:text-negro'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </li>
      ))}

      {items.length < maximo && (
        <li>
          {agregando ? (
            <input
              autoFocus
              aria-label={`Nombre de la nueva ${singular}`}
              maxLength={40}
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              onKeyDown={alTeclear}
              onBlur={confirmar}
              className="h-9 w-40 rounded-full border-2 border-negro px-3.5 text-sm font-medium outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setAgregando(true)}
              className={`${base} border-dashed border-gris-300 text-gris-500 hover:text-negro`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Agregar
            </button>
          )}
        </li>
      )}
    </ul>
  );
}
