import { Campo } from '../../components/Campo';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  nombre: string;
  contacto: string;
  slug: string;
  errores: Record<string, string>;
  onChange: (cambios: { nombre?: string; contacto?: string }) => void;
};

export function SeccionDatos({ nombre, contacto, slug, errores, onChange }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Quiénes son</h2>

      <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_240px]">
        <Campo
          id="circuito-nombre"
          rotulo="Nombre del circuito"
          value={nombre}
          onChange={(evento) => onChange({ nombre: evento.target.value })}
          error={errores.nombre}
        />
        {/* Solo lectura: es el link que la organización ya compartió, no cambia con el nombre. */}
        <Campo id="circuito-slug" rotulo="Dirección pública" numerico readOnly value={`/${slug}`} />
      </div>

      <Campo
        id="circuito-contacto"
        rotulo="Contacto"
        placeholder="Para que los jugadores sepan a quién escribirle"
        value={contacto}
        onChange={(evento) => onChange({ contacto: evento.target.value })}
        error={errores.contacto}
      />
    </Tarjeta>
  );
}
