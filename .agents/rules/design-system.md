# Rule: Design System Guidelines for Rebel Wings FRONT-TICKETS

When working on components or pages in this project, follow these design rules strictly:

1. **Brand Identity Colors**:
   - Primary Corporate Red: `#D3152A` (Brand logo, primary CTAs like `+ CREAR TICKET`, active tab highlights, user avatar background).
   - Secondary Accent Gold: `#FDB813`.
   - Dark Accent Charcoal: `#1E1E24`.
   - Canvas Background: `#F4F6FA`.
   - Soft Brand Tint: `#FFF1F2`.

2. **Data Priority Semáforo (STRICT SEPARATION)**:
   - Do NOT use brand colors for data priority/status.
   - Priority & Status colors: Critical `#EF4444`, Warning `#F59E0B`, Success `#10B981`, Admin `#8A00DA`, Info `#0F62FE`.

3. **Floating Canvas & Dashboard Elements**:
   - Navigation tabs, KPI cards, toolbar buttons, and accordion headers float directly on `#F4F6FA` canvas. Avoid enclosing header cards with flat white container boxes.

4. **Floating Card Rows for Tables**:
   - Use `border-collapse: separate; border-spacing: 0 0.55rem;` for tables like `admin-tickets-list`.
   - Each `<tr>` must be a floating card with `14px` border radius, `#e2e8f0` border, soft shadow, and hover elevation `transform: translateY(-2px)`.

5. **Select Controls**:
   - Select dropdowns must use `.table-select-custom` capsule inputs with centered text and property fallback `selectedOption?.nombre || selectedOption?.name`.
