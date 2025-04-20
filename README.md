<p align="center">
  <!-- Utilizando el logo SVG presente en los assets -->
  <img src="src/assets/logo.svg" alt="Ávoris Technical Test Logo" width="250"/><br />
</p>

# Prueba técnica Angular avanzada: Buscador de hoteles interactivo

## 📜 Descripción general

Este repositorio contiene una solución completa y avanzada para la prueba técnica de Angular propuesta por **Ávoris Corporación Empresarial**. El proyecto consiste en una Single Page Application (SPA) robusta que permite a los usuarios explorar, buscar, filtrar y ordenar un listado de hoteles de manera eficiente e intuitiva.

La aplicación está construida utilizando las características más recientes de **Angular 17+**, adopta un enfoque **100% reactivo** basado en **RxJS** para la gestión de estado y asincronía, y utiliza **Bootstrap 5** para una interfaz de usuario responsiva y moderna. Consume una API REST simulada mediante `json-server` a partir del archivo `db.json`.

🎨 **Diseño inspirado:** La paleta de colores y algunos elementos visuales se inspiran en la web oficial [avoristravel.com](https://www.avoristravel.com/) para una mayor coherencia estética.

🛠️ **Generador de imágenes funcional:** Se sustituyó el servicio de imágenes placeholder original (que no funcionaba en la plantilla inicial) por `picsum.photos`, asegurando la carga correcta de imágenes aleatorias.

📄 **Desarrollo guiado por SRD:** La implementación de funcionalidades extra y restricciones técnicas (como el uso exclusivo de `inject()` y Observables) fue guiada por un **[Documento de Requisitos de Software (SRD)](docs/SRD.md)** detallado (`docs/SRD.md`), generado a partir de los requisitos iniciales para demostrar un enfoque de desarrollo profesional y completo.

🌐 **Demo desplegada:** **[https://angular-spa-latest.onrender.com](https://angular-spa-latest.onrender.com)**
_(Nota: La versión desplegada utiliza el frontend compilado para producción, pero **no incluye** el backend `json-server`. Ver sección "Notas importantes".)_

---

## 📚 Tabla de contenidos

- [✅ Cumplimiento de requisitos originales](#-cumplimiento-de-requisitos-originales)
- [✨ Extras y mejoras implementadas](#-extras-y-mejoras-implementadas-más-allá-de-los-requisitos)
- [🏗️ Arquitectura del proyecto](#️-arquitectura-del-proyecto)
- [🚀 Stack tecnológico y conceptos clave](#-stack-tecnológico-y-conceptos-clave)
- [📁 Estructura detallada del proyecto](#-estructura-detallada-del-proyecto)
- [🛠️ Configuración y ejecución local](#️-configuración-y-ejecución-local)
  - [Prerrequisitos](#prerrequisitos)
  - [Pasos](#pasos)
- [⚙️ Scripts NPM disponibles](#️-scripts-npm-disponibles)
- [🐳 Uso con Docker](#-uso-con-docker)
  - [Entorno de producción (Build y ejecución)](#-entorno-de-producción-build-y-ejecución)
  - [Entorno de desarrollo (Docker - Script ad-hoc)](#-entorno-de-desarrollo-docker---script-ad-hoc)
- [🧪 Pruebas unitarias y cobertura](#-pruebas-unitarias-y-cobertura)
- [🧹 Calidad de código (Linting y formateo)](#-calidad-de-código-linting-y-formateo)
- [🌍 Despliegue (Ejemplo con Render y Docker Hub)](#-despliegue-ejemplo-con-render-y-docker-hub)
- [⚠️ Notas importantes](#️-notas-importantes)
- [👨‍💻 Autor](#-autor)

---

## ✅ Cumplimiento de requisitos originales

A continuación se listan los requisitos básicos solicitados en la descripción inicial de la prueba, marcados como completados:

- ✅ **Listado de hoteles:** Mostrar la lista de hoteles.
- ✅ **Filtro por nombre:** Implementado con lógica "contains".
- ✅ **Filtro por categoría:** Implementado con checkboxes (1-5 estrellas, selección múltiple).
- ✅ **Filtro por valoración:** Implementado con input `range` (0-5), mostrando hoteles >= al valor.
- ✅ **Filtro por precio:** Implementado con input `range` (50€-1000€), mostrando hoteles <= al valor.
- ✅ **Paginación:** Implementada funcionalidad básica de navegación entre páginas.
- ✅ **Diseño amigable:** Utilizado Bootstrap 5 para un diseño claro y responsivo (requisito opcional valorado).
- ✅ **Configuración inicial:** Utilizado el esqueleto proporcionado, `npm install` y `npm run generate-db`.
- ✅ **Ejecución:** Funciona con `npm run start` (Angular + `json-server`).
- ✅ **Uso de Angular 17:** Aplicación generada y desarrollada con Angular 17.
- ✅ **Uso de características modernas:** Valoración positiva (implementado extensivamente).
- ✅ **Pruebas unitarias:** Valoración positiva (implementadas extensivamente aunque no eran obligatorias).

---

## ✨ Extras y mejoras implementadas (más allá de los requisitos)

Además de cumplir con lo solicitado, se han añadido numerosas características y mejoras para crear una aplicación más robusta, moderna y profesional:

**Mejoras funcionales y de UX:**

- **Ordenación avanzada:** Funcionalidad completa para ordenar por Precio, Valoración, Estrellas y Nombre (asc/desc).
- **Paginación mejorada:**
  - Controles completos: Primera, Anterior, Siguiente, Última página.
  - Información detallada: "Página X de Y" y "Mostrando X-Y de Z hoteles".
  - Selector de tamaño de página: El usuario puede elegir cuántos hoteles ver (9, 18, 27, 36).
  - Reset automático de paginación al filtrar/ordenar.
- **Filtrado mejorado:**
  - Debounce en filtro de nombre para optimizar rendimiento.
  - Botón "Aplicar filtros": Permite configurar múltiples filtros antes de lanzar la búsqueda.
  - Indicador de cambios pendientes: El botón "Aplicar" se activa visualmente solo si hay cambios.
  - Badges de filtros activos: Muestra los filtros actuales y permite eliminarlos individualmente.
  - Botón "Limpiar filtros" funcional.
- **Vista de detalle del hotel:** Página dedicada para cada hotel con carga reactiva de datos (estado local o API) y manejo de imagen optimizado.
- **Spinner de carga global:** Indicador visual centralizado con overlay y tiempo mínimo de aparición (800ms) para evitar parpadeos durante la carga de datos.
- **Manejo de estados de UI:**
  - Placeholders visuales (`@defer @placeholder`) durante la carga inicial de la lista.
  - Mensaje específico "No se encontraron resultados" (solo si hay filtros activos).
  - Mensaje de error (`@defer @error`) si falla la carga de datos.
- **Página 404:** Componente y ruta dedicados para rutas no encontradas.

**Mejoras técnicas y de arquitectura:**

- **Arquitectura 100% Standalone:** Sin NgModules, usando `app.config.ts` para configuración global.
- **Arquitectura por features (Dominios):** Código organizado por funcionalidad (`features/hotels`).
- **Lazy loading de rutas:** Carga diferida de la feature `hotels` y el componente `NotFound` para optimizar el _bundle_ inicial.
- **Inyección de dependencias con `inject()`:** Uso exclusivo de `inject()` (Restricción autoimpuesta vía SRD).
- **Programación 100% reactiva (RxJS):**
  - Gestión de estado centralizada en `HotelStateService` con `BehaviorSubject`.
  - Uso extensivo de operadores RxJS para derivar estados y manejar lógica asíncrona.
  - Uso preferente del pipe `async` en plantillas.
  - **Sin `Promise` ni `async/await`** (Restricción autoimpuesta vía SRD).
- **Interceptor HTTP:** Para automatizar el manejo del spinner de carga.
- **Tipado estricto (TypeScript):** Interfaces claras y modo `strict` habilitado.
- **Pruebas unitarias extensivas:** Cobertura significativa de componentes y servicios con Jasmine/Karma (ver sección de pruebas para detalles).
- **Calidad de código:** Configuración y uso de ESLint y Prettier.

**Herramientas y entorno:**

- **Documentación (SRD):** Creación de `docs/SRD.md` detallando requisitos funcionales y no funcionales.
- **Dockerización completa:**
  - `Dockerfile` multi-stage optimizado para producción con Nginx.
  - `docker-compose.yml` para ejecutar el entorno de producción.
  - Script `npm run docker:dev` para entorno de desarrollo con Docker (Angular + json-server + hot-reload).
- **Configuración de entornos:** Archivos `environment.ts` y `environment.prod.ts`.

---

## 🏗️ Arquitectura del proyecto

La aplicación sigue una arquitectura moderna y modular, optimizada para escalabilidad y mantenibilidad:

- **Arquitectura por features (Dominios):** El código está organizado en torno a funcionalidades de negocio principales. La funcionalidad central `hotels` reside en su propio directorio `src/app/features/hotels/`. Esto promueve una alta cohesión dentro de cada feature y un bajo acoplamiento entre ellas.
- **Componentes Standalone:** Se utiliza exclusivamente la arquitectura de componentes `standalone` introducida en Angular 14 y promovida en versiones posteriores. **No se utilizan NgModules**, simplificando la estructura y la gestión de dependencias. La configuración global se centraliza en `app.config.ts`.
- **Enrutamiento por feature con carga diferida (Lazy Loading):**
  - Las rutas principales (`app.routes.ts`) delegan las rutas específicas de cada feature a archivos de enrutamiento dedicados dentro de la carpeta de la feature (ej. `hotels.routes.ts`).
  - Se utiliza `loadChildren` para cargar el conjunto de rutas de la feature `hotels` de forma diferida. El componente `NotFound` también se carga de forma diferida con `loadComponent`. Esto significa que el código de una feature solo se descarga cuando el usuario navega a una ruta perteneciente a esa feature, mejorando significativamente el tiempo de carga inicial de la aplicación.
- **Separación de responsabilidades:**
  - **Core:** Contiene lógica transversal como interceptores HTTP y servicios globales (ej. `LoadingService`).
  - **Shared:** Alberga componentes y utilidades verdaderamente reutilizables en múltiples features (ej. `LoadingSpinnerComponent`, `NotFoundComponent`).
  - **Features:** Encapsulan toda la lógica, componentes, servicios, modelos y rutas específicas de un dominio de negocio (ej. `hotels`).
  - **Components (Layout):** Componentes globales responsables de la estructura visual principal (`HeaderComponent`, `FooterComponent`).
- **Gestión de estado reactiva:** El estado de la feature `hotels` se centraliza en `HotelStateService` utilizando RxJS (`BehaviorSubject`), permitiendo a los componentes suscribirse a los cambios de estado de forma reactiva y desacoplada.

---

## 🚀 Stack tecnológico y conceptos clave

- **Framework:** Angular 17.1.x
- **Lenguaje:** TypeScript 5.3.x (`strict: true`)
- **Estilos:** SCSS, Bootstrap 5.3, Bootstrap Icons 1.11
- **Gestión de estado/asincronía:** RxJS 7.8
- **HTTP:** Angular `HttpClient`
- **API Mocking (Dev):** `json-server`
- **Generación de datos mock:** `@faker-js/faker`
- **Generación de imágenes mock:** `picsum.photos`
- **Testing:** Jasmine 5.1, Karma 6.4, `HttpClientTestingModule`
- **Cobertura:** `karma-coverage`
- **Linting:** ESLint 9.x (`@angular-eslint`, `@typescript-eslint`)
- **Formateo:** Prettier 3.x
- **Contenerización:** Docker, Docker Compose
- **Servidor web (Prod):** Nginx (en Docker)
- **Conceptos Angular clave:** **Componentes Standalone**, **`inject()`**, Control de flujo (`@if`, `@for`, `@defer`), Pipe `async`, `HttpInterceptor`, **Carga diferida de rutas (`loadChildren`/`loadComponent`)**, `ActivatedRoute`, `ReactiveFormsModule`.
- **Conceptos RxJS clave:** `BehaviorSubject`, `Observable`, `pipe`, `map`, `switchMap`, `combineLatest`, `distinctUntilChanged`, `tap`, `catchError`, `finalize`, `of`, `timer`, `debounceTime`.

---

## 📁 Estructura detallada del proyecto

| Ruta                                                                              | Descripción                                                          |
| :-------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| `src/`                                                                            | Código fuente de la aplicación Angular.                              |
| `src/app/`                                                                        | Componente raíz, config. (`app.config.ts`), rutas (`app.routes.ts`). |
| `src/app/components/`                                                             | Componentes globales de layout (Header, Footer).                     |
| `src/app/core/`                                                                   | Lógica central: `interceptors/` (Loading), `services/` (Loading).    |
| `src/app/features/hotels/`                                                        | **Feature principal:** Lógica de hoteles.                            |
| `  ├── components/`                                                               | Componentes específicos: Card, Filters, Pagination, Sort.            |
| `  ├── models/`                                                                   | Interfaces TypeScript: Hotel, FilterState, SortState, etc.           |
| `  ├── pages/`                                                                    | Componentes de página: HotelList, HotelDetail.                       |
| `  ├── services/`                                                                 | Servicios: `HotelsService` (API), `HotelStateService` (Estado).      |
| `  └── hotels.routes.ts`                                                          | **Rutas específicas de la feature 'hotels' (Lazy Loaded).**          |
| `src/app/shared/`                                                                 | Componentes/utilidades reutilizables: Spinner, NotFound.             |
| `src/assets/`                                                                     | Archivos estáticos (imágenes, logos).                                |
| `src/environments/`                                                               | Archivos de configuración de entorno (dev, prod).                    |
| `docs/SRD.md`                                                                     | **Documento de requisitos de software** (define extras).             |
| `generate-hotels-db.js`                                                           | Script Node.js para generar `db.json`.                               |
| `db.json`                                                                         | Base de datos mock para `json-server` (Ignorada por Git).            |
| `Dockerfile`                                                                      | Definición de imagen Docker multi-stage para producción.             |
| `docker-compose.yml`                                                              | Docker Compose para lanzar el contenedor de producción (Nginx).      |
| `nginx.conf`                                                                      | Configuración de Nginx para servir la SPA en producción.             |
| `.dockerignore`, `.gitignore`, `.prettier*`, `eslint.config.mjs`, `.editorconfig` | Archivos de configuración y exclusión.                               |
| `angular.json`, `package.json`, `tsconfig.*.json`                                 | Configuraciones de Angular, NPM y TypeScript.                        |
| `README.md`                                                                       | **Este archivo.**                                                    |

---

## 🛠️ Configuración y ejecución local

### Prerrequisitos

- Node.js (v20.x o superior)
- npm (v10.x o superior)
- Git

### Pasos

1.  **Clonar:** `git clone <URL_DEL_REPOSITORIO>`
2.  **Navegar:** `cd <NOMBRE_DEL_DIRECTORIO>`
3.  **Instalar dependencias:** `npm install`
4.  **Generar base de datos mock:** `npm run generate-db` (Crea `db.json` con 100 hoteles)
5.  **Iniciar servidores (Angular + json-server):**
    ```bash
    npm run start
    ```
    - Frontend Angular disponible en: `http://localhost:4200/`
    - API Mock `json-server` disponible en: `http://localhost:3000/` (Endpoint: `http://localhost:3000/hotels`)

---

## ⚙️ Scripts NPM disponibles

A continuación se describen los scripts definidos en `package.json`:

- `npm run ng -- <comando-angular>`: Ejecuta comandos del Angular CLI (ej. `npm run ng -- g c mi-componente`).
- `npm run start`: Inicia la aplicación en modo desarrollo. Lanza concurrentemente el servidor de desarrollo de Angular (`ng serve`) y el servidor `json-server` para la API mock.
- `npm run build`: Compila la aplicación Angular para producción, generando los artefactos en la carpeta `dist/`.
- `npm run watch`: Compila la aplicación en modo desarrollo y la mantiene observando cambios en los archivos fuente para recompilar automáticamente.
- `npm run test`: Ejecuta las pruebas unitarias con Karma/Jasmine en modo _watch_ y genera un informe de cobertura de código.
- `npm run generate-db`: Ejecuta el script `generate-hotels-db.js` para crear o actualizar el archivo `db.json` con datos ficticios.
- `npm run lint`: Ejecuta ESLint para analizar el código TypeScript y HTML en busca de errores y problemas de estilo.
- `npm run format`: Ejecuta Prettier para formatear automáticamente los archivos `.ts`, `.html`, `.css`, `.scss` del proyecto según las reglas definidas.
- `npm run format:check`: Ejecuta Prettier en modo verificación, indicando si algún archivo necesita ser formateado pero sin modificarlo.
- `npm run docker:build`: Construye la imagen Docker para producción utilizando el `Dockerfile`.
- `npm run docker:run`: Ejecuta un contenedor Docker a partir de la imagen de producción construida previamente, exponiendo la aplicación en el puerto 8080.
- `npm run docker:dev`: Ejecuta un entorno de desarrollo contenerizado utilizando Docker. Levanta un contenedor Node.js, instala dependencias y ejecuta `ng serve` con el host `0.0.0.0` para acceso externo, montando el código local como volumen para permitir hot-reload. (Nota: `json-server` no está incluido en este script específico, debe ejecutarse por separado o añadirse a la configuración del script/docker-compose si se desea).

---

## 🐳 Uso con Docker

### 🔧 Entorno de producción (Build y ejecución)

1.  **Construir imagen:** `docker build -t angular-spa:latest .`
2.  **Ejecutar contenedor:** `docker run --rm -p 8080:80 angular-spa:latest`
    - Accede en: `http://localhost:8080`

### 🧪 Entorno de desarrollo (Docker - Script ad-hoc)

El script `docker:dev` levanta un contenedor para el frontend Angular (con hot-reload) usando una configuración definida directamente en el comando `package.json`, ideal para desarrollo interactivo si prefieres trabajar dentro de un contenedor.

```bash
npm run docker:dev
```

- Frontend Angular (dev server): `http://localhost:4200`
- **Nota:** Este script **no** levanta `json-server`. Ejecútalo localmente con `npm run start` (que usa concurrently) o adapta el script `docker:dev` / usa `docker-compose` para incluir también `json-server` en Docker si es necesario.

---

## 🧪 Pruebas unitarias y cobertura

El proyecto incluye una suite de pruebas unitarias robusta utilizando Jasmine y Karma.

- **Ejecutar pruebas:**
  ```bash
  npm run test
  ```
- **Cobertura de código:** Las pruebas están configuradas para generar un informe de cobertura. Se han alcanzado los siguientes niveles, superando ampliamente los estándares habituales:
  ```
  =============================== Coverage summary ===============================
  Statements   : 95.22% ( 259/272 )
  Branches     : 89.04% ( 65/73 )
  Functions    : 91.13% ( 72/79 )
  Lines        : 94.9% ( 242/255 )
  ================================================================================
  ```
- **Informe detallado:** Puedes encontrar el informe HTML completo de cobertura en el directorio `coverage/` (generado después de ejecutar `npm run test`). Abre el archivo `index.html` dentro de esa carpeta en tu navegador para explorar la cobertura por archivo y línea.

---

## 🧹 Calidad de código (Linting y formateo)

Se utilizan ESLint y Prettier para mantener una alta calidad y consistencia en el código.

- **Verificar linting:** `npm run lint`
- **Formatear código:** `npm run format`
- **Verificar formato:** `npm run format:check`

---

## 🌍 Despliegue (Ejemplo con Render y Docker Hub)

Pasos para desplegar la imagen de producción en [Render.com](https://render.com/).

1.  **Construir y etiquetar imagen:** `docker build -t <tu-usuario-dockerhub>/angular-spa:latest .`
2.  **Iniciar sesión Docker Hub:** `docker login`
3.  **Subir imagen:** `docker push <tu-usuario-dockerhub>/angular-spa:latest`
4.  **Desplegar en Render:**
    - Ve a [https://dashboard.render.com](https://dashboard.render.com).
    - Nuevo "Web Service" > "Deploy an existing image...".
    - URL Imagen: `docker.io/<tu-usuario-dockerhub>/angular-spa:latest`.
    - Configura nombre, región, plan (`Free`).
    - Render detectará el puerto 80.
    - Crea el servicio.

---

## ⚠️ Notas importantes

- **API Mock en producción:** La configuración de despliegue actual **solo incluye el frontend**. El `json-server` (backend mock) **no** está desplegado. Por lo tanto, **las llamadas a la API fallarán en la demo desplegada**.
- **URL de API:** La aplicación desplegada intentará conectarse a la URL definida en `src/environments/environment.prod.ts`.
- **Solución para producción real:** Para una funcionalidad completa, se requeriría desplegar un backend real (o el `json-server`) y actualizar `apiUrl` en `src/environments/environment.prod.ts` antes de construir la imagen final.

---

## 👨‍💻 Autor

- **Marius Mihail Ion**
- [GitHub](https://github.com/mihailmariusiondev)
- [LinkedIn](https://www.linkedin.com/in/mariusdev/)

_Prueba técnica realizada para Ávoris Corporación Empresarial (Abril 2025), ampliando significativamente los requisitos iniciales y aplicando prácticas modernas de desarrollo y arquitectura Angular._

```
</write_to_file>
```
