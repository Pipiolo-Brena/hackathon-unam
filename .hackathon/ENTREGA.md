# Entrega: hackathon-unam

- Generado: 2026-11-20 12:57 (windows x64)
- Stack verificado: Python 3.12.12, Node 22.23.1, uv 0.11.19
- Dashboard compilado: sí (dashboard/dist)
- Backend: se importa sin errores
- Archivos incluidos: 177 (828.7 MB sin comprimir)
- Desviaciones del stack: si (1)

## Avisos
- README.md no tiene ninguna imagen; los jueces piden un visual bien formateado
- el proyecto se sale del stack en 1 parte(s) (ver sección Desviaciones del stack)

## Desviaciones del stack (AWS no hospeda proyectos fuera del stack)
- Contrato de despliegue
  - el dashboard llama a localhost (usa rutas relativas como api/...): dashboard/src/services/api.ts

## Cómo ejecutarlo
Ver INSTALACION.md del evento. Backend: `uvicorn backend.main:app`. Dashboard: `cd dashboard && npm ci && npm run dev`.
