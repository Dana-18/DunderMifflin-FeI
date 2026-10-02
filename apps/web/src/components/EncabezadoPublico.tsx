import type { ReactNode } from 'react';

type Props = {
  /** Lo que va a la derecha del logo. */
  children?: ReactNode;
};

// Encabezado de las pantallas sin sesión (registro, ingreso). El del panel,
// negro y con navegación, es EncabezadoOrganizador.
export function EncabezadoPublico({ children }: Props) {
  return (
    <header className="flex h-[60px] items-center justify-between gap-6 border-b border-linea bg-white px-7">
      <div className="flex items-center gap-[9px]">
        <div className="flex size-6 items-center justify-center rounded-[7px] bg-lima">
          <div className="size-2 rounded-full bg-negro" />
        </div>
        <span className="text-base font-semibold tracking-[-0.02em]">SetPoint</span>
      </div>
      {children}
    </header>
  );
}
