# Rule: Sistema de Diseño e Identidad de Marca Rebel Wings

Esta regla establece las directrices globales de diseño, paleta de colores oficial y componentes visuales para el proyecto FRONT-TICKETS de Rebel Wings.

---

## 🎨 Paleta de Colores Oficiales (Rebel Wings)

| Token | Nombre | Código HEX | Uso Exclusivo |
| :--- | :--- | :--- | :--- |
| `$rw-primary` | **Rojo Rebel (Bandera)** | `#D3152A` | Identidad institucional, botón principal `+ CREAR TICKET`, marcas activas, logotipos. |
| `$rw-accent` | **Amarillo Dorado (Asta)** | `#FDB813` | Acentos secundarios de marca, insignias institucionales, resaltados decorativos. |
| `$rw-dark` | **Carbón Rebel (Fondo)** | `#1E1E24` | Encabezados de módulo, barras de herramientas contrastantes, tipografía principal. |
| `$rw-canvas` | **Gris Lienzo Neumórfico** | `#F4F6FA` | Fondo de pantalla principal (canvas) donde flotan las tarjetas y pestañas. |

---

## ⚠️ Regla de Oro: Separación entre Marca y Semáforo de Prioridades

> [!IMPORTANT]
> **NUNCA utilizar los colores institucionales de marca para indicar estados o niveles de urgencia del semáforo de tickets.**

1. **Colores de Marca (Corporativo)**:
   - **Rojo Rebel (`#D3152A`)** se reserva para CTAs primarios de marca (`+ CREAR TICKET`), logotipos y elementos de identidad.
   - **Carbón Rebel (`#1E1E24`)** y **Amarillo Dorado (`#FDB813`)** se usan para acentos corporativos.

2. **Colores del Semáforo de Prioridades (Semántica de Datos)**:
   - **Crítico / Alerta Alta**: Rosa/Carmesí de estado (`#EF4444` / `#E11D48`).
   - **Atención / En Proceso**: Ámbar de estado (`#F59E0B` / `#D97706`).
   - **Resuelto / Al Día**: Verde Esmeralda de estado (`#10B981` / `#059669`).
   - **Validación Admin**: Púrpura de estado (`#8A00DA` / `#7E22CE`).

---

## 📐 Estructura de Componentes

### 1. Canvas y Tarjetas Flotantes
- El fondo de pantalla siempre debe ser `#F4F6FA` (Gris Lienzo Neumórfico).
- Las tarjetas, toolbars y contenedores flotan con `background: #FFFFFF`, `border-radius: 14px - 16px`, `border: 1px solid #E2E8F0` y sombras muy suaves (`box-shadow: 0 4px 18px rgba(0,0,0,0.03)`).

### 2. Acordeones de Sucursales
- **Encabezado Minimalista Directo**: Estructurado como `[Badge Numérico Conteo]` + `[Nombre de Sucursal]` + `[Insignias de Alerta Circulares a la derecha]`.
- **Sin Texto Repetitivo**: NUNCA agregar palabras como "TICKETS" o nombres de responsables en la cabecera del acordeón.
- **Fondo con Tinte Pastel de Estado**:
  - Crítico: Degradado suave rosa pastel (`#FFF1F2`).
  - Atención: Degradado suave ámbar pastel (`#FFFBEB`).
  - Al Día: Degradado suave verde pastel (`#F0FDF4`).

---

## ⚡ Reglas de Desarrollo UI

1. Preservar siempre la lógica de negocio, servicios, modelos e interfaces de Angular.
2. Todo nuevo componente o rediseño debe alinearse estrictamente a estos tokens visuales.
3. Priorizar el contraste de lectura (estándar WCAG AA) y usabilidad de alto nivel.
