// Convierte el nombre de la organización en la parte final de su link público.
// "Polenta Team Tenis" -> "polenta-team-tenis"
//
// Vive en shared porque lo usan los dos lados: la web para mostrar la vista
// previa del link mientras se escribe, y la API para generar el slug real.
export function generarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // saca los acentos: "Otoño" -> "Otono"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
