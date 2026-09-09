# Rebel Wings Design System - FRONT-TICKETS

Sistema de diseño oficial y arquitectura de interfaz para la plataforma **ERP REBEL TICKETS**.

---

## 1. Paleta de Colores Oficial de Marca vs. Semáforo de Datos

### 🔴 Colores Institucionales de Marca Rebel Wings
Reservados para elementos corporativos, navegación principal, logotipos y botones de acción principal (CTA):

| Nombre | Código HEX | Aplicación |
| :--- | :--- | :--- |
| **Rojo Rebel (Principal)** | `#D3152A` | Logotipo, botón principal `+ CREAR TICKET`, pestaña activa de navegación, avatares de usuario, indicadores activos de marca. |
| **Amarillo Dorado (Acento)** | `#FDB813` | Detalles de marca y acentos secundarios. |
| **Carbón Rebel (Oscuro)** | `#1E1E24` | Encabezados dark y elementos de alta jerarquía. |
| **Gris Lienzo (Canvas)** | `#F4F6FA` | Fondo general de pantalla y lienzo neumórfico del dashboard. |
| **Tinte Rojo Suave** | `#FFF1F2` | Fondo de resaltado para pestañas activas e ítems seleccionados. |

---

### 🚦 Semáforo de Prioridades y Estados de Datos (REGLA ESTRICTA)
> [!IMPORTANT]
> **REGLA ESTRICTA DE DISEÑO**: Nunca mezclar los colores corporativos de Rebel Wings (`#D3152A`) con los colores de datos. La prioridad y los estados de los tickets utilizan exclusivamente su propio semáforo funcional.

| Estado / Prioridad | Código HEX | Tinte Fondo Pastel |
| :--- | :--- | :--- |
| **Crítico / Atender Ya (>= 5 tickets)** | `#EF4444` | `#FFF1F2` |
| **En Proceso / Atención Activa (1 - 4 tickets)** | `#F59E0B` | `#FFFBEB` |
| **Por Validar / Completado (0 tickets)** | `#10B981` | `#F0FDF4` |
| **Validación Admin** | `#8A00DA` | `#F3E8FF` |
| **Compras / Info** | `#0F62FE` | `#EFF6FF` |

---

## 2. Arquitectura de Layout y Componentes Dashboard

### 📊 Tarjetas KPI y Lienzo Flotante
- El fondo de la página utiliza el lienzo `#F4F6FA`.
- La barra de título, las 5 Tarjetas KPI Dashboard (`Nuevos Tickets`, `En Proceso`, `Por Validar`, `Validación Admin`, `Compras`) y la botonera de acciones flotan **directamente** sobre el lienzo `#F4F6FA` sin contenedores blancos envolventes rígidos.

---

### 🃏 Filas de Tabla como Tarjetas Flotantes (*Floating Card Rows*)
- En el componente `admin-tickets-list`, cada fila de ticket es una **tarjeta blanca independiente**.
- Estructura:
  - `border-collapse: separate; border-spacing: 0 0.55rem;`
  - Esquinas redondeadas de `14px` (`border-radius: 14px`).
  - Sombra sutil `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03)` y borde `1px solid #e2e8f0`.
  - Elevación 3D en hover: `transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07)`.

---

### 🔘 Selectores Homologados (`.table-select-custom`)
- Todos los menús desplegables (`AREA`, `CATEGORÍA`, `SUBCATEGORÍA`, `ESTATUS`, `ASISTENCIA`) y campos de fecha (`DEATHLINE`) en las tablas se presentan en **cápsulas blancas centradas**:
  - Borde `#cbd5e1`, esquinas `8px`, texto en negrita `font-weight: 700`, indicador de flecha a la derecha.
  - Evaluación segura de propiedades `selectedOption?.nombre || selectedOption?.name` para evitar celdas vacías.

---

### 📂 Acordeones de Sucursales (`branches-tickets-accordion` & `user-tickets-accordion`)
- Cabecera limpia: Muestra únicamente `[Badge Conteo]` + `[Nombre Sucursal]`.
- Flechador de expansión `v` integrado a la derecha (`right: 1.25rem`) dentro de la tarjeta de cabecera.
- Cuerpo desplegado (`p-accordion-content`) como tarjeta separada con `border-radius: 16px` y cinta de controles internos (`.accordion-subtoggles-strip`) en tono gris `#F8FAFC`.
