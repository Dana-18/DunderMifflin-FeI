// Error que un servicio lanza cuando sabe qué código HTTP corresponde.
// El middleware de errores lo convierte en la respuesta; el servicio no
// conoce a Express.
export class ErrorHttp extends Error {
  constructor(
    public readonly status: number,
    mensaje: string,
    // Errores atribuibles a un campo del formulario: { email: '...' }
    public readonly campos?: Record<string, string>,
  ) {
    super(mensaje);
    this.name = 'ErrorHttp';
  }
}
