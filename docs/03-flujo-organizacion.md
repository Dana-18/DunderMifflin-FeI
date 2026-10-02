# Flujo de la organización (web)

> Reglas de negocio en [02-dominio.md](02-dominio.md).

---

## 1. Roles y entidades

### Con cuenta de usuario

| Rol | Accede desde | Responsabilidad |
|---|---|---|
| **Organización** | Web | Padrón, torneos, sorteo, resultados, cierre |
| **Jugador** | App móvil | Se inscribe, paga, coordina fechas, consulta |

Solo dos roles con autenticación.

### Sin cuenta

| Entidad | Qué es |
|---|---|
| **Club / sede** | Dirección y canchas. Dato, no usuario |
| **Jugador (perfil de padrón)** | La persona en el padrón. Existe sin cuenta |

El sistema es **multi-organización**: `organizacion_id` es la clave de aislamiento de torneos, categorías, rankings, padrón y liquidaciones. Debe estar en el schema desde el primer día.

Un club puede alojar torneos de circuitos distintos, y una organización rota entre varios clubes.

---

## 2. Ciclo de vida del torneo

```
borrador → publicado → inscripciones_cerradas → zonas_generadas
        → grupos_en_curso → campeonato_y_complementaria → finalizado
```

| Estado | Se entra cuando | Qué se puede hacer |
|---|---|---|
| `borrador` | Se crea el torneo | Editar todo. No visible |
| `publicado` | La organización lo publica | Inscripciones abiertas |
| `inscripciones_cerradas` | Se llena el cupo o vence la fecha | Revisar padrón, resolver lista de espera |
| `zonas_generadas` | Se ejecuta el sorteo | Comunicar grupos y plazos |
| `grupos_en_curso` | Arranca el plazo de 3 semanas | Cargar resultados de zona |
| `campeonato_y_complementaria` | Cierran todas las zonas | Ambos cuadros en juego, 1 semana por ronda |
| `finalizado` | Se definen ambos campeones | Solo lectura. Se impactan los puntos |

> **Nota:** a diferencia de versiones anteriores, la organización **no paga** por publicar un torneo. El modelo de ingresos del circuito son las inscripciones de los jugadores.

---

## 3. Alta de la organización

Registro con email y contraseña. Tiene dos momentos:

**1. Crear la cuenta** (pantalla "Registrar tu organización", `POST /api/auth/registro`). Pide solo lo indispensable: nombre del circuito, nombre y apellido de quien lo administra, email y contraseña. En una misma transacción se crean el usuario, la organización y el vínculo de administrador; si algo falla, no queda nada a medias.

- El **slug** del link público se genera del nombre del circuito (`Polenta Team Tenis` → `polenta-team-tenis`). Si ya está tomado, se le agrega un sufijo numérico: dos circuitos pueden llamarse igual, y rechazar el registro por eso sería un obstáculo sin sentido.
- El email es único en todo el sistema. Si ya tiene cuenta, la API responde 409 y el formulario lo muestra en el campo.
- La contraseña se guarda hasheada con bcrypt, con un mínimo de 8 caracteres.
- La respuesta es la misma que la del ingreso (token JWT y datos de la cuenta, ver "Ingreso y sesión"), para que quien se registra quede con la sesión iniciada sin tener que ingresar de nuevo.
- Las reglas de validación viven en `packages/shared` y las aplican la web y la API con el mismo schema de Zod.

> **Por qué no se pide más en el registro:** la configuración del ranking es opcional ([07-configurabilidad.md](07-configurabilidad.md) §1, `usa_ranking`). Pedirla de entrada frenaría a quien solo quiere probar la plataforma con un torneo suelto.

**2. Configurar el circuito** (pantalla "Tu circuito", en `/circuito`; es a donde se llega después de registrarse o ingresar). No hay un alta aparte: el circuito **es** la organización que se creó en el registro, y acá se la configura.

- Nombre y datos de contacto. La **dirección pública (slug) no cambia** aunque cambie el nombre: es el link que la organización ya compartió.
- **Categorías propias** (en POLENTA: Segunda y Tercera). Van aparte del ranking porque hacen falta siempre: todo torneo es de una categoría.
- **Ranking anual** (`usa_ranking`), que se prende o se apaga. Apagarlo no borra las etapas ni los puntos: solo dejan de mostrarse.
- **Etapas del calendario** (Primavera, Verano, Pretemporada, Otoño, Invierno) — definen los casilleros del ranking
- **Tabla de puntos por instancia.** Una organización nueva ve la tabla por defecto (100 / 75 / 50 / 25 / 15 / 10) hasta que guarda la suya.
- Clubes con los que trabaja: **todavía no implementado**; se hace con el alta de clubes (§4).

Cómo se guarda:

- `GET` y `PUT /api/organizaciones/:slug/circuito`. Las dos pasan por `autenticar`, y el servicio comprueba además que el usuario **administre esa organización** (403 si no): el token dice quién es, no qué puede tocar.
- **Se guarda solo**, 800 ms después del último cambio, con el hook `useGuardadoAutomatico`: valida con el schema de Zod compartido antes de enviar (si no pasa, no manda nada y marca el campo) y nunca tiene dos guardados a la vez. *Por qué sin botón:* es configuración que se ajusta de a poco, y un "Guardar" olvidado pierde trabajo.
- El `PUT` manda **la configuración completa** y se aplica en **una transacción de Prisma**: datos de la organización, categorías, etapas y tabla de puntos. Si un paso falla, no queda nada a medias.
- Las categorías y etapas se identifican **por nombre**. Las que se quitan **se desactivan, no se borran**, porque puede haber torneos, jugadores o puntos de ranking que las referencian. Si se vuelve a agregar una con el mismo nombre, se reactiva la misma fila y conserva su historial.

### Ingreso y sesión

Pantalla "Ingresar" (`/ingresar`, `POST /api/auth/ingreso`), con email y contraseña.

- **Autenticación por token JWT, sin sesiones en el servidor.** El token se firma con `JWT_SECRET`, dura 7 días y lleva el id del usuario (`sub`) y el `organizacion_id`. *Por qué:* la API no guarda estado, así que la misma autenticación sirve para la web y para la app móvil sin cookies ni tabla de sesiones.
- **Credenciales incorrectas:** 401 con un único mensaje para "no existe el email" y "contraseña incorrecta". Distinguirlos le diría a cualquiera qué emails tienen cuenta.
- **Cuenta sin organización** (un jugador): 403. El panel web es solo para organizaciones; los jugadores entran desde la app.
- **Varias organizaciones:** el schema lo permite, pero hoy cada usuario administra una. Se entra a la primera; el selector queda para cuando haga falta.
- **En la web** el token se guarda en `localStorage` junto con los datos del usuario y la organización, y viaja en el encabezado `Authorization: Bearer` de cada pedido.
- **En la API**, el middleware `autenticar` verifica el token y deja el id del usuario y de la organización en el request. `GET /api/auth/yo` es la primera ruta protegida.
- **Sesión rechazada:** si la API responde 401 o 403 a un pedido que llevaba token (vencido o sin permiso), el hook `useSesionRechazada` borra la sesión y manda a "Ingresar", con un aviso de que venció.
- **Fuera de alcance por ahora:** cerrar sesión (falta la navegación del panel donde ponerlo) y recuperar la contraseña (necesita envío de emails).

---

## 4. Alta de clubes y canchas

Nombre, dirección y canchas con superficie. Alta de datos, sin usuario asociado.

Para las fases eliminatorias, el torneo declara su **sede designada**. En fase de grupos no hace falta: cada partido se juega donde acuerden los jugadores.

---

## 5. Gestión del padrón

La organización es dueña de su padrón. En modo `cerrada` —el que usa POLENTA— es además la única vía de alta; en modo `abierta` los jugadores se agregan solos al inscribirse ([07-configurabilidad.md](07-configurabilidad.md) §2.5). En todos los modos, la organización puede:

- Alta manual de jugadores
- **Importación desde Excel** con normalización y resolución de identidad ([06-ia.md](06-ia.md) §1)
- Asignación y reasignación de categoría
- Baja o desactivación

El padrón actual de POLENTA tiene 77 jugadores en 2 categorías.

---

## 6. Creación del torneo

El formulario replica la convocatoria que hoy publican en WhatsApp ([02](02-dominio.md) §12):

- Nombre y descripción
- **Etapa del calendario** — define qué casillero del ranking se actualiza
- Categorías a disputar y cupo de cada una
- Importe de inscripción
- **Formato**: cantidad de grupos, clasificados por grupo, si hay zona Complementaria, modo de distribución y modo de sorteo
- **Sistema de juego**: sets, punto de oro, super tie-break
- Fecha de cierre de inscripción
- **Cronograma por instancia**
- Sedes: libre o designada, por fase

> Todos los valores por defecto salen de la configuración de la organización. El listado completo de parámetros está en [07-configurabilidad.md](07-configurabilidad.md).

---

## 7. Gestión de inscripciones

Panel con el padrón en vivo: confirmados, pendientes de pago, cupo restante y **lista de espera**.

Funciones:

- Inscribir manualmente a quien pagó por fuera del sistema
- Dar de baja y **promover automáticamente al primero de la lista de espera**
- Enviar recordatorio a quienes no completaron el pago
- Cerrar inscripciones

La lista de espera se ordena **por orden de llegada** y cubre deserciones, replicando la regla actual del reglamento.

---

## 8. Sorteo y generación de zonas

Dos parámetros independientes ([07-configurabilidad.md](07-configurabilidad.md) §2.1):

- **`modo_distribucion`** — cómo se reparten los jugadores: `serpentina`, `directa` o `bombos`
- **`modo_sorteo`** — quién lo ejecuta: `automatico`, `asistido` (en pantalla, para proyectar) o `manual` (la organización carga el resultado del sorteo físico)

El sistema genera los grupos y los partidos de zona. La organización puede revisar antes de confirmar.

**Si hay zona Complementaria** (parámetro del torneo), se reserva desde el sorteo la estructura de ambos cuadros.

---

## 9. Seguimiento: tablero de avance

Pantalla central durante el torneo. Por grupo muestra:

- Partidos jugados, con fecha acordada, y sin coordinar
- Días restantes del plazo
- Alertas de partidos en riesgo de vencimiento
- Tabla de posiciones en vivo con la línea de corte marcada

Reemplaza el trabajo actual de revisar el grupo de WhatsApp a mano.

---

## 10. Carga de resultados

**La carga es responsabilidad de la organización.** Los jugadores no cargan resultados ([04-flujo-jugador.md](04-flujo-jugador.md) §2).

Por partido: sets, games, tie-breaks y ganador, validado contra el sistema de juego configurado en el torneo ([07-configurabilidad.md](07-configurabilidad.md) §2.2).

Al guardar:

- Se recalcula la tabla de posiciones de la zona con la cascada de desempates
- Si era de cuadro, el ganador avanza a la siguiente ronda del cuadro que corresponda

**Partidos no jugados en plazo:** no se resuelven con regla automática. El sistema presenta el caso con el historial de coordinación y la organización decide W.O., doble W.O. o extensión. El W.O. se registra como **6-0 6-0**.

---

## 11. Cierre de fase de grupos

Al completarse las zonas, el sistema:

1. Ordena cada grupo con la cascada de desempates
2. Manda los N primeros de cada grupo al cuadro **Campeonato** (N configurable; en POLENTA, 2)
3. **Si el torneo tiene zona Complementaria**, manda al resto a ese segundo cuadro
4. Genera los cuadros correspondientes

Cuando hay dos cuadros, corren en paralelo con el mismo plazo por ronda.

---

## 12. Cierre del torneo

Con ambos campeones definidos, la organización cierra el torneo. El sistema:

- Genera los `MovimientoRanking` según instancia alcanzada
- **Reemplaza el casillero de esa etapa** en el ranking de cada jugador
