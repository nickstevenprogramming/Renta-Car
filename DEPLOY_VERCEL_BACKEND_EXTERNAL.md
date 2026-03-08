# Checklist De Deploy: Frontend En Vercel + Backend Externo

Este checklist es obligatorio para un despliegue estable en producción.

## 1) Frontend (Vercel)

- Directorio raíz del proyecto en Vercel: `frontend`
- Configuración de build:
  - Install Command: `npm ci`
  - Build Command: `npm run build`
  - Output Directory: `build`
- Mantener `frontend/vercel.json` como configuración activa para rewrites SPA.

## 2) Variables De Entorno Del Frontend (Vercel)

Configura esto en Vercel Project Settings > Environment Variables:

- `REACT_APP_API_URL=https://<tu-dominio-backend>`

Reglas:

- Debe usar `https` en producción.
- No debe apuntar a `localhost`.
- Debe aplicarse en `Production` y `Preview`.

## 3) Variables De Entorno Del Backend (Hosting Externo)

Configura esto en la plataforma donde corre el backend (App Service/contenedor/etc.):

- `AZURE_SQL_CONNECTIONSTRING=<cadena-conexion-azure-sql>`
- `JWT_SECRET=<secret-aleatorio-fuerte>`
- `FRONTEND_URL=https://<tu-app-vercel>.vercel.app`
- `ALLOW_VERCEL_PREVIEWS=false` (ponlo en `true` si los previews deben consumir backend)
- `SMTP_SERVER`, `SMTP_PORT`, `SENDER_EMAIL`, `SENDER_PASSWORD`
- `ADMIN_EMAIL`

Reglas:

- Nunca subir valores reales de `.env` al repositorio.
- Rotar cualquier secreto previamente expuesto.
- Usar `.env` solo para desarrollo local.

## 4) CORS

El backend debe permitir el origen del frontend en Vercel definido en `FRONTEND_URL`.

Si necesitas previews:

- Configura `ALLOW_VERCEL_PREVIEWS=true`
- Mantén también la URL de producción explícita en `FRONTEND_URL`.

## 5) Bloqueadores De Producción (deben estar en verde)

- El backend `/health` responde `200` con payload `{"status":"ok"}`.
- El frontend `/` y `/admin` responden `200` (rewrite SPA funcionando).
- El login devuelve token y las rutas admin responden `200` con bearer token válido.
- No existen URLs `localhost` en el build de producción del frontend.
- No hay secretos versionados en el historial git.

## 6) Smoke Test Post-Deploy

Ejecuta:

```powershell
pwsh -File scripts/smoke-test.ps1 `
  -BackendUrl "https://<tu-dominio-backend>" `
  -FrontendUrl "https://<tu-app-vercel>.vercel.app" `
  -AdminCedula "<cedula-admin>" `
  -AdminPassword "<password-admin>"
```

Si no deseas pruebas de autenticación, omite `-AdminCedula` y `-AdminPassword`.
