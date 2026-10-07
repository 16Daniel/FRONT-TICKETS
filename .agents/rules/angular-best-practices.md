# Angular Best Practices & Architectural Rules

1. **Separación de Interfaces**:
   Nunca declares una `interface` dentro del mismo archivo `.ts` de un componente. Todas las interfaces deben vivir en archivos independientes (`.interface.ts`) dentro del directorio `interfaces/` correspondiente a su módulo.

2. **Single Responsibility Principle (SRP) en Componentes**:
   Evita mezclar lógica de procesamiento y transformación de datos dentro del componente (incluso si es un componente Orquestador). 
   - El componente Orquestador debe encargarse únicamente de suscribirse a los servicios de backend y pasar los datos resultantes a los componentes de presentación vía `@Input`.
   - Si se requiere formatear, procesar o transformar datos crudos (ej. cálculos estadísticos, SLAs, diccionarios de métricas) para preparar el input de los componentes visuales hijos, delega esa lógica a un Servicio o Helper dedicado (ej. `UmbralRadarService`).
