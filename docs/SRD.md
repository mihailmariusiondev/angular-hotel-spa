# Software Requirements Document (SRD)

**Proyecto:** Prueba Técnica Angular – Listado y Filtros de Hoteles
**Versión:** 1.8
**Fecha:** 2025-04-17

---

## 1. Introducción

- **1.1 Propósito:**
  Especificar los requisitos funcionales y no funcionales para una Single Page Application (SPA) con Angular 17. La aplicación mostrará un listado interactivo de hoteles con funcionalidades de filtrado, ordenación y paginación. Se utilizará Bootstrap para la UI y se implementará un enfoque puramente reactivo basado exclusivamente en RxJS (Observables) para toda la gestión asíncrona y de estado. Se priorizarán las características modernas de Angular 17, como componentes standalone e `inject()`, con la **prohibición estricta y total del uso de `constructor()` y de `Promise`** en todo el código de la aplicación.

- **1.2 Alcance:**
  Desarrollo de un frontend que consume datos de `http://localhost:3000/hotels` (`json-server`) mediante peticiones HTTP gestionadas con Observables. El foco está en la visualización de datos, filtrado dinámico múltiple, ordenación, paginación avanzada, y feedback al usuario, dentro de una estructura de proyecto predefinida y sin usar constructores ni promesas.

- **1.3 Definiciones:**
  - **Hotel:** Entidad con `id`, `name`, `image`, `address`, `stars`, `rate`, `price`.
  - **Standalone Component:** Componente, directiva o pipe Angular con `standalone: true`, sin `NgModule`.
  - **Control de Flujo Declarativo (@if, @else):** Sintaxis Angular 17 para condicionales (`@if`, `@else if`, `@else`).
  - **Deferred Views (@defer):** Sintaxis Angular 17 para carga diferida (`@defer`, `@placeholder`, `@loading`, `@error`).
  - **inject():** Función Angular para inyección de dependencias. **Única** forma permitida para DI.
  - **BehaviorSubject:** Clase RxJS para estado reactivo, multicasting del último valor.
  - **Spinner Global:** Indicador visual de carga (spinner + overlay) durante actualizaciones, gestionado exclusivamente con Observables.
  - **Bootstrap:** Framework CSS/JS (versión 5+).
  - **Debounce:** Operador RxJS (`debounceTime`) para retrasar emisión.
  - **Accessibility (a11y):** Prácticas para usabilidad universal.
  - **setTimeout Manual:** Uso directo de `window.setTimeout()` (**prohibido**).
  - **constructor():** Método especial de clase para inicialización (**prohibido en toda clase de la aplicación**).
  - **Promise:** Objeto JavaScript para operaciones asíncronas (su uso, incluyendo `async/await` sobre Promises, está **prohibido**).
  - **Observable:** Concepto central de RxJS para manejar flujos de datos asíncronos o síncronos. **Única** forma permitida para gestionar asincronía.

## 2. Requisitos Funcionales Detallados (RF)

- **RF-01: Mostrar Listado de Hoteles:**

  - Al iniciar la aplicación, se debe realizar una petición HTTP GET a `http://localhost:3000/hotels` utilizando el `HttpClient` de Angular, que devuelve un `Observable`.
  - La suscripción a este `Observable` (preferentemente mediante el pipe `async` en la plantilla) debe resultar en la muestra inicial de la lista de hoteles sin filtros aplicados.
  - Cada hotel en la lista debe mostrar visualmente: Imagen (`hotel.image`), Nombre (`hotel.name`), Dirección (`hotel.address`), Categoría (`hotel.stars` con iconos), Valoración (`hotel.rate`), Precio (`hotel.price` formateado EUR).

- **RF-02: Filtro por Nombre (Contains) con Debounce:**

  - Proveer un `input type="text"`.
  - El valor del input debe gestionarse reactivamente (ej: con `FormControl` o un `Subject`).
  - Aplicar operadores RxJS `debounceTime` (~400ms) y `distinctUntilChanged` al flujo de valores del input antes de disparar la lógica de filtrado.
  - El filtrado debe ser case-insensitive y buscar coincidencias parciales (`contains`) en `hotel.name`.
  - La lista de hoteles visible (un `Observable` derivado) debe actualizarse automáticamente.

- **RF-03: Filtro por Categoría (Estrellas):**

  - Proveer checkboxes (1-5) etiquetados.
  - El estado de selección de los checkboxes debe gestionarse reactivamente.
  - Si se seleccionan estrellas, mostrar hoteles cuya `hotel.stars` esté incluida en las seleccionadas (lógica OR).
  - Si no hay selección, no aplicar este filtro.
  - La lista visible debe actualizarse reactivamente.

- **RF-04: Filtro por Valoración Mínima:**

  - Proveer un `input type="range"` (0-5, paso 0.1). Mostrar valor actual (ej: "≥ 3.5").
  - Gestionar el valor del slider reactivamente.
  - Mostrar hoteles con `hotel.rate >=` valor seleccionado.
  - La lista visible debe actualizarse reactivamente.

- **RF-05: Filtro por Precio Máximo:**

  - Proveer un `input type="range"` (50-1000, paso 10/50). Mostrar valor actual (ej: "≤ 250 €").
  - Gestionar el valor del slider reactivamente.
  - Mostrar hoteles con `hotel.price <=` valor seleccionado.
  - La lista visible debe actualizarse reactivamente.

- **RF-06: Paginación Mejorada:**

  - Presentar la lista filtrada/ordenada en páginas (tamaño fijo, ej: 9/12).
  - Implementar controles Bootstrap `pagination`: Primera, Anterior, "Página X de Y", Siguiente, Última (con estados deshabilitados gestionados reactivamente).
  - (Opcional) Enlaces a números de página.
  - Al cambiar filtros u ordenación, el estado de paginación debe resetearse reactivamente a la página 1.

- **RF-07: Carga Progresiva con @defer:**

  - Usar `@defer` para la sección principal de la lista.
  - Bloques `@placeholder`/`@loading` (indicador visual) y `@error` (mensaje). La condición de trigger para `@defer` debe basarse en Observables si es necesario (ej: `when`).

- **RF-08: Control de Flujo con @if/@else:**

  - Uso exclusivo de `@if`, `@else if`, `@else` para condicionales en plantillas. No `*ngIf`, `*ngSwitch`.

- **RF-09: Spinner Global con Overlay Reactivo:**

  - Mostrar overlay semitransparente y spinner Bootstrap durante actualizaciones (filtrado/ordenación).
  - La visibilidad debe ser controlada por un `Observable<boolean>` (derivado de un `BehaviorSubject<boolean>` de estado de carga). Poner a `true` antes de iniciar la operación (que debe ser síncrona o manejada con Observables) y a `false` al completarse y tener los datos listos en el flujo de Observables.
  - **No usar `setTimeout` ni `Promise`** para gestionar su visibilidad.

- **RF-10: Botón "Limpiar Filtros":**

  - Botón "Limpiar Filtros".
  - Al hacer clic, debe emitir un evento o actualizar el estado reactivo para resetear todos los filtros (nombre, estrellas, valoración, precio) a sus valores por defecto.
  - Como consecuencia de esta actualización de estado, la lista debe actualizarse y la paginación resetearse a página 1 reactivamente.

- **RF-11: Indicadores Visuales de Filtros Activos:**

  - Mostrar dinámicamente los filtros activos (derivados del estado reactivo de filtros) usando `badge` de Bootstrap.
  - Ejemplos: `[Nombre: "Plaza" x]`, `[Estrellas: ★★★★ x]`, etc.
  - (Opcional) Clic en 'x' dispara evento/actualización de estado para quitar ese filtro.

- **RF-12: Mensaje "No se encontraron resultados":**

  - Mostrar mensaje claro (ej: "No se encontraron hoteles...") cuando el `Observable` de la lista filtrada emita un array vacío. Utilizar `@if (filteredHotels.length === 0)` (asumiendo `filteredHotels` es el resultado del `async` pipe).

- **RF-13: Ordenación de Resultados:**

  - Control `<select>` Bootstrap para ordenar por: Precio (asc/desc), Valoración (asc/desc), Estrellas (asc/desc), Nombre (A-Z/Z-A).
  - Gestionar la selección de ordenación reactivamente.
  - Al cambiar la ordenación, el estado se actualiza, lo que dispara la re-ordenación del `Observable` de hoteles, muestra el spinner global, y resetea la paginación a página 1.

- **RF-14: Indicador de Número de Resultados:**
  - Mostrar texto "Mostrando X-Y de Z hoteles".
  - Los valores X, Y, Z deben derivarse reactivamente del estado de paginación y del total de ítems filtrados.

## 3. Requisitos No Funcionales Detallados (RNF)

- **RNF-01: Componentes Standalone:**

  - Todos los componentes, directivas, pipes deben ser `standalone: true`. Configuración en `app.config.ts`. No `NgModule`.

- **RNF-02: Prohibición Total de `constructor()` y Uso Exclusivo de `inject()`:**

  - **Absolutamente prohibido definir `constructor()`** en cualquier clase (componente, servicio, directiva, pipe).
  - Inyección de dependencias **únicamente** con `inject()` en el contexto de inicialización.
  - Inicialización de propiedades sin DI mediante inicializadores de propiedad o hooks de ciclo de vida (sin `constructor`).

- **RNF-03: Gestión Reactiva Pura (RxJS y `async` pipe):**

  - **No usar `.subscribe()`** manual en componentes/servicios si se puede evitar (preferir `async` pipe u operadores RxJS para manejar efectos secundarios).
  - No gestionar `Subscription` manualmente.
  - Todo el manejo de eventos, estado y asincronía debe basarse en Observables de RxJS y consumirse preferentemente con el pipe `async` en plantillas.

- **RNF-04: Manejo de Estado con `BehaviorSubject`:**

  - Utilizar `BehaviorSubject` para fuentes de estado reactivo (filtros, ordenación, página actual, estado de carga).
  - Combinar estos `BehaviorSubject` con operadores RxJS para derivar el estado final (ej: lista de hoteles filtrada y paginada).
  - Exponer `BehaviorSubject` públicamente solo vía `.asObservable()`.

- **RNF-05: Separación de Archivos:**

  - Componentes con `.ts`, `.html`, `.scss` separados.

- **RNF-06: Estilos con Bootstrap y SCSS:**

  - Bootstrap 5+ para layout y componentes. SCSS para personalización. `src/styles.scss`.

- **RNF-07: Estructura del Proyecto Existente:**

  - Adherirse estrictamente a la estructura de directorios inicial. Colocar archivos lógicamente.

- **RNF-08: Compatibilidad y Versiones:**

  - Angular CLI 17.1.x+, TypeScript 5.3.x+.

- **RNF-09: Rendimiento y Fluidez:**

  - UI responsiva. `debounceTime`, gestión reactiva eficiente.

- **RNF-10: Exclusión de Signals:**

  - No usar Signals. Foco exclusivo en RxJS/Observables.

- **RNF-11: Presentación sin Tablas HTML:**

  - Listado con `div`, `card` Bootstrap. No `<table>`.

- **RNF-12: Código Limpio y Mantenible:**

  - Código claro, legible, siguiendo guías de estilo (Prettier/ESLint).

- **RNF-13: Tipado Estricto:**

  - Modo `strict` de TS. Interfaces claras (`Hotel`, `FilterState`, `SortState`, `PaginationState`).

- **RNF-14: Accesibilidad (a11y):**

  - Etiquetas, navegación teclado, foco visible, ARIA apropiado (ej: `aria-busy`, `aria-live`).

- **RNF-15: Prohibición de `setTimeout` Manual:**

  - **Prohibido usar `window.setTimeout()`**. Temporización solo con operadores RxJS (ej: `timer`, `delay`, `debounceTime`).

- **RNF-16: Prohibición de Promesas (`Promise`, `async/await`):**
  - **Queda estrictamente prohibido el uso de `Promise`** en todo el código de la aplicación.
  - Esto incluye la creación explícita de `new Promise()`, el uso de funciones que devuelvan Promesas (si no hay alternativa Observable), y el uso de `async/await` para consumir Promesas.
  - Toda operación asíncrona (peticiones HTTP, eventos de UI, temporizadores) debe ser manejada exclusivamente mediante `Observables` de RxJS.
