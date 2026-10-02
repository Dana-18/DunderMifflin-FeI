import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: string;
  numerico?: boolean;
  /** Texto de apoyo debajo del campo. */
  ayuda?: ReactNode;
  /** Texto corto dentro del campo, a la derecha. */
  adorno?: ReactNode;
  /** Mensaje de error. Reemplaza a la ayuda mientras está. */
  error?: string;
};

export function Campo({ id, rotulo, numerico = false, ayuda, adorno, error, className = '', ...props }: Props) {
  const idMensaje = `${id}-mensaje`;
  // design.md §3: el rojo es solo para vencimientos. El error se marca con el
  // borde negro de 2px del campo activo y el mensaje debajo.
  const borde = error
    ? 'border-2 border-negro px-[13px]'
    : 'border border-gris-300 px-3.5 focus:border-2 focus:border-negro focus:px-[13px]';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-[13px] font-semibold text-gris-500">
        {rotulo}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? idMensaje : undefined}
          className={`h-12 w-full rounded-control text-[15px] text-negro outline-none placeholder:text-gris-400 ${borde} ${adorno ? 'pr-20' : ''} ${numerico ? 'font-mono tabular-nums' : ''}`}
          {...props}
        />
        {adorno && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center font-mono text-xs text-gris-500">
            {adorno}
          </span>
        )}
      </div>
      {error ? (
        <p id={idMensaje} role="alert" className="text-[13px] font-medium text-negro">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={idMensaje} className="font-mono text-xs text-gris-500">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}
