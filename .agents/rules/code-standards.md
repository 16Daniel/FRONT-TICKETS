# Rule: Estándares de Código y Estructura de Archivos

1. **Interfaces y Modelos en Archivos Independientes**:
   - **NUNCA** declarar interfaces o modelos inline dentro de componentes (`.ts`), páginas o servicios.
   - Toda interfaz o modelo debe crearse en su propio archivo dentro de la carpeta `interfaces/` del módulo correspondiente:
     - Formato: `src/app/<modulo>/interfaces/<nombre>.interface.ts` o `<nombre>.model.ts`.
     - Ejemplo: `src/app/tickets/interfaces/cuadrante-info.interface.ts`.
   - Exportar la interfaz e importarla explícitamente donde sea requerida.

2. **Nombres de Componentes, Clases, Carpetas, Archivos y Variables en Español**:
   - **TODOS** los nombres de componentes, clases, selectores, carpetas, archivos y variables deben redactarse **SIEMPRE EN ESPAÑOL**.
   - No usar nombres en inglés para nuevas funcionalidades, componentes o variables.
   - Ejemplos:
     - `nodo-arbol-categoria` (no `category-tree-node`)
     - `formulario-nodo-categoria` (no `category-node-form`)
     - `selector-matriz-criticidad` (no `matriz-criticidad-picker`)
     - `tarjeta-guia-matriz` (no `matriz-guia-card`)
