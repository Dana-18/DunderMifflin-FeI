import { ListaEditable } from '../../components/ListaEditable';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  categorias: string[];
  onChange: (categorias: string[]) => void;
};

// Va aparte del ranking porque las categorías hacen falta siempre: todo
// torneo es de una categoría, aunque el circuito no acumule puntos.
export function SeccionCategorias({ categorias, onChange }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-[5px]">
        <h2 className="text-[17px] font-semibold">Categorías</h2>
        <p className="text-sm text-gris-500">Cada torneo se juega en una categoría, y cada una tiene su ranking independiente.</p>
      </div>
      <ListaEditable items={categorias} onChange={onChange} variante="oscura" singular="categoría" />
      {categorias.length === 0 && (
        <p className="text-[13px] text-gris-500">Todavía no cargaste ninguna. Agregá al menos una para poder crear un torneo.</p>
      )}
    </Tarjeta>
  );
}
