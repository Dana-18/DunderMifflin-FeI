import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { generarSlug, registroOrganizacionSchema, type RegistroOrganizacion } from '@setpoint/shared';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { ErrorDeApi } from '../../lib/api';
import { guardarSesion } from '../../lib/sesion';
import { fortalezaDePassword } from './fortaleza';
import { useRegistrarOrganizacion } from './registro.api';

type NombreCampo = keyof RegistroOrganizacion;
type Errores = Partial<Record<NombreCampo, string>>;

const VACIO: RegistroOrganizacion = {
  nombreOrganizacion: '',
  nombre: '',
  apellido: '',
  email: '',
  password: '',
};

export function FormularioRegistro() {
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const registro = useRegistrarOrganizacion();
  const navigate = useNavigate();

  const slug = generarSlug(valores.nombreOrganizacion);
  const fortaleza = fortalezaDePassword(valores.password);

  // Los errores que devuelve la API (por ejemplo, el email ya registrado) se
  // muestran en el mismo lugar que los de la validación local.
  const erroresDeApi: Errores = registro.error instanceof ErrorDeApi ? registro.error.campos : {};
  const errorDe = (campo: NombreCampo) => errores[campo] ?? erroresDeApi[campo];

  // Error que no es de ningún campo: sin conexión, falla del servidor.
  const errorGeneral =
    registro.error && Object.keys(erroresDeApi).length === 0 ? registro.error.message : null;

  function cambiar(campo: NombreCampo) {
    return (evento: ChangeEvent<HTMLInputElement>) => {
      setValores({ ...valores, [campo]: evento.target.value });
      // Al corregir un campo se le saca el error, sin esperar a reenviar.
      if (errores[campo]) setErrores({ ...errores, [campo]: undefined });
      if (registro.isError) registro.reset();
    };
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();

    // Mismo schema que aplica la API: si no pasa acá, no pasaría allá.
    const resultado = registroOrganizacionSchema.safeParse(valores);
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
    registro.mutate(resultado.data, {
      onSuccess: (sesion) => {
        // Primero se guarda la sesión y después se navega: la pantalla de
        // inicio ya tiene que encontrar la sesión.
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
          id="registro-organizacion"
          rotulo="Nombre del circuito o grupo"
          placeholder="Polenta Team Tenis"
          autoComplete="organization"
          autoFocus
          value={valores.nombreOrganizacion}
          onChange={cambiar('nombreOrganizacion')}
          error={errorDe('nombreOrganizacion')}
          ayuda={`setpoint.com.ar/${slug || 'tu-circuito'} · así lo van a ver los jugadores`}
        />

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Campo
            id="registro-nombre"
            rotulo="Tu nombre"
            autoComplete="given-name"
            value={valores.nombre}
            onChange={cambiar('nombre')}
            error={errorDe('nombre')}
          />
          <Campo
            id="registro-apellido"
            rotulo="Tu apellido"
            autoComplete="family-name"
            value={valores.apellido}
            onChange={cambiar('apellido')}
            error={errorDe('apellido')}
          />
        </div>

        <Campo
          id="registro-email"
          rotulo="Tu email"
          type="email"
          autoComplete="email"
          value={valores.email}
          onChange={cambiar('email')}
          error={errorDe('email')}
        />

        <Campo
          id="registro-password"
          rotulo="Contraseña"
          type="password"
          autoComplete="new-password"
          value={valores.password}
          onChange={cambiar('password')}
          error={errorDe('password')}
          adorno={fortaleza}
          ayuda="al menos 8 caracteres"
        />
      </div>

      <div className="flex flex-col gap-[11px]">
        {errorGeneral && (
          <p role="alert" className="text-center text-sm font-medium text-negro">
            {errorGeneral}
          </p>
        )}
        <Boton variante="organizador" type="submit" disabled={registro.isPending} className="h-12 w-full">
          {registro.isPending ? 'Creando la organización…' : 'Crear la organización'}
        </Boton>
        <p className="text-center text-[13px] leading-[1.45] text-gris-500">
          Al continuar aceptás los términos del servicio.
        </p>
      </div>
    </form>
  );
}
