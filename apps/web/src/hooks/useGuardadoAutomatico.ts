import { useCallback, useEffect, useRef, useState } from 'react';

export type EstadoGuardado = 'al-dia' | 'guardando' | 'guardado' | 'invalido' | 'error';

// Lo único que el hook necesita de un schema de Zod. Declararlo así evita
// atarlo a un schema en particular: sirve para cualquier formulario.
type Validador<T> = {
  safeParse(
    valor: unknown,
  ): { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };
};

type Opciones<T> = {
  /** El estado del formulario. Cada vez que cambia, se programa un guardado. */
  valor: T;
  schema: Validador<T>;
  guardar: (datos: T) => Promise<unknown>;
  /** Milisegundos sin cambios antes de guardar. */
  espera?: number;
};

// Guarda solo, sin botón:
//   1. espera a que pasen `espera` ms desde el último cambio (así no manda un
//      pedido por cada letra)
//   2. valida con el schema; si no pasa, no manda nada y devuelve los errores
//   3. nunca hay dos guardados a la vez: si llega un cambio mientras uno está
//      en curso, se guarda de nuevo cuando ese termina
export function useGuardadoAutomatico<T>({ valor, schema, guardar, espera = 800 }: Opciones<T>) {
  const [estado, setEstado] = useState<EstadoGuardado>('al-dia');
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Refs y no estado: son datos que el hook necesita recordar entre renders
  // pero que no tienen que provocar uno nuevo al cambiar.
  const ultimoGuardado = useRef(JSON.stringify(valor));
  const enCurso = useRef(false);
  const quedoPendiente = useRef(false);
  const valorActual = useRef(valor);
  const guardarActual = useRef(guardar);

  useEffect(() => {
    valorActual.current = valor;
    guardarActual.current = guardar;
  });

  const guardarAhora = useCallback(async () => {
    // Ya hay un guardado viajando: se anota que quedó algo por mandar y lo
    // retoma el bucle de abajo cuando ese termine.
    if (enCurso.current) {
      quedoPendiente.current = true;
      return;
    }

    do {
      quedoPendiente.current = false;

      const serializado = JSON.stringify(valorActual.current);
      if (serializado === ultimoGuardado.current) return;

      const resultado = schema.safeParse(valorActual.current);
      if (!resultado.success) {
        const nuevos: Record<string, string> = {};
        for (const problema of resultado.error.issues) {
          const campo = String(problema.path[0] ?? '');
          if (campo && !nuevos[campo]) nuevos[campo] = problema.message;
        }
        setErrores(nuevos);
        setEstado('invalido');
        return;
      }

      setErrores({});
      setEstado('guardando');
      enCurso.current = true;
      try {
        await guardarActual.current(resultado.data);
        ultimoGuardado.current = serializado;
        setEstado('guardado');
      } catch {
        setEstado('error');
        return;
      } finally {
        enCurso.current = false;
      }
    } while (quedoPendiente.current);
  }, [schema]);

  useEffect(() => {
    if (JSON.stringify(valor) === ultimoGuardado.current) return;

    // Cada cambio cancela el reloj anterior y arranca uno nuevo: solo se
    // guarda cuando la persona deja de escribir.
    const reloj = setTimeout(() => void guardarAhora(), espera);
    return () => clearTimeout(reloj);
  }, [valor, espera, guardarAhora]);

  return { estado, errores, reintentar: guardarAhora };
}
