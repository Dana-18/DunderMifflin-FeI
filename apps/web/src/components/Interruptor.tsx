type Props = {
  activo: boolean;
  onChange: (activo: boolean) => void;
  /** Qué prende o apaga. No se ve: es para lectores de pantalla. */
  etiqueta: string;
};

export function Interruptor({ activo, onChange, etiqueta }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => onChange(!activo)}
      className={`flex h-6 w-10 shrink-0 items-center rounded-full p-[3px] ${
        activo ? 'justify-end bg-negro' : 'justify-start bg-linea'
      }`}
    >
      <span className="size-[18px] rounded-full bg-white" />
    </button>
  );
}
