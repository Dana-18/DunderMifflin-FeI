export type Fortaleza = 'corta' | 'buena' | 'fuerte';

// Orientación para quien escribe la contraseña, no una regla: lo único que se
// exige es el mínimo de 8 caracteres del schema compartido.
export function fortalezaDePassword(password: string): Fortaleza | null {
  if (password.length === 0) return null;
  if (password.length < 8) return 'corta';

  const mezclaLetrasYNumeros = /[a-zA-Z]/.test(password) && /\d/.test(password);
  return password.length >= 12 && mezclaLetrasYNumeros ? 'fuerte' : 'buena';
}
