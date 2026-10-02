import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ingresoSchema, type Ingreso } from '@setpoint/shared';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { guardarSesion } from '../../lib/sesion';
import { useIngresar } from './ingreso.api';

type NombreCampo = keyof Ingreso;
type Errores = Partial<Record<NombreCampo, string>>;

const VACIO: Ingreso = { email: '', password: '' };

export function FormularioIngreso() {
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const ingreso = useIngresar();
  const navigate = useNavigate();

  function cambiar(campo: NombreCampo) {
    return (evento: ChangeEvent<HTMLInputElement>) => {
      setValores({ ...valores, [campo]: evento.target.value });
      if (errores[campo]) setErrores({ ...errores, [campo]: undefined });
      if (ingreso.isError) ingreso.reset();
    };
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();

    const resultado = ingresoSchema.safeParse(valores);
    if (!resultado.success) {
      const nuevos: Errores = {};
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0] as NombreCampo;
        if (!nuevos[campo]) nuevos[campo] = problema.message;
      }
      setErrores(nuevos);
      return;
    }

    setErrores({});
    ingreso.mutate(resultado.data, {
      onSuccess: (sesion) => {
        // Primero se guarda la sesión y después se navega: la pantalla de
        // inicio ya tiene que encontrarla.
        guardarSesion(sesion);
        navigate('/');
      },
    });
  }

  return (
    // noValidate: los mensajes son los nuestros, no los globos del navegador.
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-3.5">
        <Campo
          id="ingreso-email"
          rotulo="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          autoFocus
          value={valores.email}
          onChange={cambiar('email')}
          error={errores.email}
        />
        <Campo
          id="ingreso-password"
          rotulo="Contraseña"
          type="password"
          autoComplete="current-password"
          value={valores.password}
          onChange={cambiar('password')}
          error={errores.password}
        />
      </div>

      <div className="flex flex-col gap-[11px]">
        {/* El error de la API no va en un campo: no dice cuál de los dos falló. */}
        {ingreso.error && (
          <p role="alert" className="text-center text-sm font-medium text-negro">
            {ingreso.error.message}
          </p>
        )}
        <Boton variante="organizador" type="submit" disabled={ingreso.isPending} className="h-12 w-full">
          {ingreso.isPending ? 'Ingresando…' : 'Ingresar'}
        </Boton>
      </div>
    </form>
  );
}
