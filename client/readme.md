# React - Ejercicio Técnico de Entrevista

## Descripción del Proyecto
Lee cuidadosamente todos los requisitos y crea un producto que cumpla con las expectativas. Debes crear un repositorio público en GitHub para subir el ejercicio y compartir el enlace en el campo de respuesta.
Tu desarrollo debe estar guiado por una historia de usuario informal que tú mismo crearás, y que debe incluirse en tu presentación.

## Características del desarrollo
- El proyecto incluye tanto frontend como backend.
- Se usará TDD
- Principios SOLID
- Arquitectura limpia
- Uso de herramientas GenAI para optimizar el desarrollo
- Diseño responsivo y SEO
- Buen manejo de estado y rutas protegidas
- Paginación de resultados

## Frontend
### Pantalla de inicio de sesión:
- Las credenciales consisten en un formulario de usuario/contraseña. Debes validar las credenciales en un backend que tienes que construir. (usuario: admin, contraseña: admin; cualquier otra combinación debe considerarse incorrecta). Muestra todas las validaciones que consideres necesarias.
- El usuario debe permanecer autenticado usando una instancia de almacenamiento de tu preferencia (BD local, LocalStorage, cookies). Las rutas deben estar protegidas: si un usuario ya autenticado intenta iniciar sesión, debe ser redirigido a la página principal; si no está autenticado e intenta acceder a la página principal, debe ser redirigido a la pantalla de login.

### Página principal:
- La pantalla de inicio tendrá una barra de búsqueda con una lista de Pokémon. Debes usar una API con los requisitos descritos más abajo. La respuesta de la API será paginada, por lo que debes implementar una solución para ello.
- Los usuarios deben poder ordenar los resultados por nombre y número.
- Cada Pokémon debe mostrarse con su foto, nombre y número.

### Vista de detalle
- Si el usuario hace clic en un Pokémon de la lista, debe ser redirigido a una página de detalle con información detallada del Pokémon (habilidades, movimientos y formas).

### Diseño final
- En este enlace encontrarás los requisitos de diseño que la aplicación debe seguir (Figma design). El diseño está hecho para pantallas móviles, pero puedes adaptarlo para pantallas más grandes.

### Notas
- Puedes usar cualquier librería para gestión de estado local y UI.
- Debes tener en cuenta SEO y diseño responsivo en tu implementación.
- Se evaluará la arquitectura que consideres mejor para la aplicación, pensando en que podría tener más funcionalidades en el futuro.
- Prepárate para discutir tu solución.

## Backend
Debes implementar tu propio backend ligero que se apoye en https://pokeapi.co/ como fuente de información para obtener datos de Pokémon. Puedes usar cualquier tecnología backend con la que te sientas cómodo (Ruby on Rails, Node.js/Express, Python/Flask o FastAPI, PHP/Laravel, etc.).
Este backend debe proveer tres endpoints:
- Login: para manejar la autorización de credenciales (admin/admin).
- /pokemons: debe proveer todos los Pokémon paginados como en la pokeapi.
- /pokemons/{id}: debe proveer la información detallada de un Pokémon.
Puedes añadir cualquier otro endpoint que consideres necesario para implementar la aplicación.
Notas:
- Puedes usar GenAI para ayudarte a escribir u optimizar tu código — ¡se recomienda!
- Si usas herramientas GenAI (Cursor, Claude Code, etc.), comparte los prompts que utilizaste y cualquier modificación que hiciste al código generado.
- No necesitas implementar autenticación completa ni una base de datos de producción, a menos que quieras hacerlo.
- Puedes usar datos en memoria, SQLite o cualquier base de datos ligera de tu elección.

### Herramientas de Generative AI
Debes añadir la siguiente tarea en el mismo repositorio dentro de un archivo README:
Imagina que debes generar un componente Tabla para un sistema simple de gestión de tareas usando tu lenguaje preferido. El sistema debe soportar:
- Crear, leer, actualizar y eliminar tareas (CRUD).
- Cada tarea tiene título, descripción, estado y fecha de vencimiento.
- Las tareas están asociadas a un usuario (asume que existe un modelo básico de Usuario).
Instrucciones:
- Usando tu herramienta GenAI preferida (Cursor, Claude Code, Windsurf, GitHub Copilot, etc.), escribe el prompt que usarías para generar el scaffold de la API o la implementación completa.
- Muestra el código de salida (o una muestra representativa).
- Describe cómo:
- Validaste las sugerencias de la IA.
- Corregiste o mejoraste la salida, si fue necesario.
- Manejaste casos límite, autenticación o validaciones.
- Evaluaste el rendimiento y la calidad idiomática del código.

### Presentación y Revisión de Código
Deberás presentar tu proyecto al panel técnico de entrevista. Durante la presentación, debes explicar tu historia de usuario, decisiones de diseño, arquitectura técnica y demostrar la funcionalidad de la aplicación. Esto se hará por Google Meets o Zoom, compartiendo pantalla de tu repositorio en GitHub o tu IDE.
Después de la presentación, el panel realizará una revisión de tu código. Te pedirán explicar tus decisiones de programación y responder preguntas relacionadas. El panel evaluará tu proyecto según los siguientes criterios:
- Arquitectura limpia: separación de responsabilidades e independencia de componentes.
- Pruebas de aplicación: cobertura suficiente de tests. Se prefiere TDD.
- Calidad de código: organizado, legible y siguiendo buenas prácticas.
- Funcionalidad: la aplicación debe cumplir los requisitos sin errores ni bugs. Opcional pero deseado: sin advertencias en la consola del navegador.
- Presentación: clara, concisa y demostrando buen entendimiento del proyecto y de las mejores prácticas de frontend y backend.
- Uso de GenAI: fluidez en herramientas de IA, ingeniería de prompts y pensamiento crítico al evaluar código generado.
