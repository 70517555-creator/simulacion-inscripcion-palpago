# Simulación del proceso de inscripción de PALPA-GO

Producto Académico N.° 03 — Pruebas y Calidad de Software (Universidad Continental).
Barja Rodriguez, Jeanpiere Levi · Cano Carhuayo, Maricarmen Shilene.

Simulación en JavaScript del registro de estudiantes y la inscripción de equipos
a la Semana Técnica 2026 de PALPA-GO. **No contiene código ni datos de producción:**
los nombres, correos y DNI son ficticios y la base de datos es un objeto en memoria.

## Estructura

| Archivo | Contenido |
|---|---|
| `src/config.js` | Parámetros del concurso: mínimo y máximo de integrantes, fecha de cierre |
| `src/inscripcion_v1.js` | Versión 1: comportamiento original, con los defectos H-03 y H-07 |
| `src/inscripcion_v2.js` | Versión 2: corrige la validación del DNI y verifica el cierre en el servidor |
| `tests/validarDNI.unit.test.js` | Pruebas unitarias U-01 a U-06 |
| `tests/inscripcion.funcional.test.js` | Casos funcionales CF-01 a CF-10 |
| `tests/fixtures.js` | Datos de prueba: padrón, horas antes y después del cierre, base vacía |
| `tests/modulo.js` | Elige la versión bajo prueba con la variable `SIM_VERSION` (v1 o v2) |

## Cómo ejecutarlo

Requiere Node.js 22 o superior.

```
npm install
npm run test:v1                  # iteración 1: 12 aprobadas, 4 fallidas
npm run test:v2                  # iteración 2: 16 de 16 aprobadas
npm run test:v2 -- --coverage    # con reporte de cobertura
```

## Evidencias

| Captura | Contenido |
|---|---|
| `01` a `03` | PALPA-GO en producción: acceso, panel y laboratorio |
| `04` a `07` | Firebase Hosting, Firestore, backend en Render y repositorio |
| `08`, `08b` | Iteración 1 (v1): 4 fallidas, 12 aprobadas |
| `09` | Iteración 2 (v2): 16 aprobadas |
| `10`, `11` | Lighthouse en modo móvil (NF-02) |
