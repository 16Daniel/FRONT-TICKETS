# Rule: Arquitectura de Árbol de Categorías y Matriz de Criticidad (3×3)

Cuando trabajes en el módulo de Categorías, Subcategorías, Tickets o Torre de Control, debes respetar estrictamente las siguientes reglas arquitectónicas:

---

## 1. Filosofía del Árbol de Categorías
1. **Árboles Independientes por Área**: Cada área operativa (Sistemas, Compras, Mantenimiento, Audio y Video, etc.) construye y gestiona su propio árbol de categorías en `cat_categorias` filtrado por `idArea`.
2. **Los Tickets Caen en Hojas Finales**: Ningún ticket debe caer en un nodo agrupador; todo ticket debe asociarse a una categoría final (hoja) que contiene el SLA y criticidad fija.
3. **Estructura Recursiva Multi-nivel**:
   - Tanto la raíz (`Categoria`) como las `Subcategoria` admiten anidamiento recursivo mediante `subcategorias?: Subcategoria[]`.
   - Las subcategorías pueden tener subcategorías adentro sin límite de profundidad ($N$ niveles).

---

## 2. Los Dos Tipos de Nodo (`tipo?: 'rama' | 'hoja'`)
- **`'rama'` (Nodo Agrupador / Carpeta)**:
  - Función: Solo organiza y agrupa nodos hijos (`subcategorias`).
  - No recibe tickets directos.
  - No tiene SLA ni cálculo de matriz 3×3.
  - Muestra la suma acumulada de los tickets de todas sus subcategorías descendientes.
- **`'hoja'` (Categoría Final / Terminal)**:
  - Almacena: `urgencia`, `score`, `criticidad`, `prioridad` (NO almacenar `slaRes`, `slaResp`, `estimacion` ni `impacto`).

---

## 3. Matriz de Criticidad 3×3 (Impacto × Urgencia)
- **Fórmula**: $\text{Score} = \text{Impacto } (1\text{ a }3) \times \text{Urgencia } (1\text{ a }3)$
- **Impacto (Filas)**:
  - `3`: Crítico (detiene operación, cocina, caja o genera riesgo de seguridad).
  - `2`: Moderado (afecta un equipo o proceso clave sin detener la sucursal).
  - `1`: Leve (molestia menor o cosmético).
- **Urgencia (Columnas)**:
  - `1`: Baja (puede esperar fila ordinaria).
  - `2`: Media (requiere atención en el turno o jornada).
  - `3`: Inmediata (emergencia operativa).

### Cuadrantes y Tiempos SLA:
| Celda (Imp-Urg) | Score | Cuadrante | SLA Resolución (`slaRes`) | SLA Respuesta (`slaResp`) |
| :---: | :---: | :---: | :---: | :---: |
| **1-1** | 1 | Bajo | 120 hrs | 24 hrs |
| **2-1** | 2 | Bajo | 72 hrs | 12 hrs |
| **3-1** | 3 | Medio | 36 hrs | 6 hrs |
| **1-2** | 2 | Bajo | 96 hrs | 16 hrs |
| **2-2** | 4 | Medio | 24 hrs | 4 hrs |
| **3-2** | 6 | Alto | 8 hrs | 0.5 hrs (30 min) |
| **1-3** | 3 | Medio | 48 hrs | 8 hrs |
| **2-3** | 6 | Alto | 12 hrs | 1 hr |
| **3-3** | 9 | Crítico | 2 hrs | 0.25 hrs (15 min) |

### Colores de Cuadrante (Tokens Rebel Wings):
- **Crítico** (Score 7–9): Tinte `#FFF1F2`, Texto `#E11D48`, Ícono `bx-flame`.
- **Alto** (Score 5–6): Tinte `#FFFBEB`, Texto `#D97706`, Ícono `bx-error-alt`.
- **Medio** (Score 3–4): Tinte `#FEFCE8`, Texto `#CA8A04`, Ícono `bx-time-five`.
- **Bajo** (Score 1–2): Tinte `#F0FDF4`, Texto `#059669`, Ícono `bx-check-circle`.

---

## 4. Persistencia en Firebase Firestore
- **Saneamiento a Objeto Plano**: Al persistir en Firestore (`updateDoc` o `setDoc`), SIEMPRE serializar con `JSON.parse(JSON.stringify(data))`.
  - **Motivo**: Firestore rechaza instancias de clases personalizadas (`new Subcategoria()`) y valores `undefined`.
- **Actualización Atómica**: Al modificar o agregar cualquier subcategoría profunda, localizar el documento raíz `Categoria` y actualizar el documento completo en `cat_categorias`.

---

## 5. Selección de Subcategorías al Crear Tickets
- En formularios y diálogos de tickets (`crear-ticket-dialog`, `modal-fa-generate-ticket`), las subcategorías anidadas se despliegan en el dropdown aplanadas con su ruta jerárquica: `Padre > Hijo > Nieto`.
