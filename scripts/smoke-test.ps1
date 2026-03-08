param(
    [Parameter(Mandatory = $true)]
    [string]$BackendUrl,

    [string]$FrontendUrl,
    [string]$AdminCedula,
    [string]$AdminPassword
)

$ErrorActionPreference = "Stop"
$failed = $false

function Pass([string]$message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Fail([string]$message) {
    Write-Host "[FAIL] $message" -ForegroundColor Red
    $script:failed = $true
}

function Normalize-Url([string]$value) {
    if ([string]::IsNullOrWhiteSpace($value)) { return $value }
    return $value.Trim().TrimEnd("/")
}

$backend = Normalize-Url $BackendUrl
$frontend = Normalize-Url $FrontendUrl

Write-Host "Ejecutando pruebas de humo..."
Write-Host "Backend: $backend"
if ($frontend) { Write-Host "Frontend: $frontend" }

# 1) Healthcheck del backend
try {
    $health = Invoke-RestMethod -Method Get -Uri "$backend/health" -TimeoutSec 30
    if ($health.status -eq "ok") {
        Pass "El endpoint de salud del backend respondio con status=ok"
    } else {
        Fail "El endpoint de salud respondio, pero el payload fue inesperado"
    }
} catch {
    Fail "Fallo el healthcheck del backend: $($_.Exception.Message)"
}

# 2) Disponibilidad frontend + ruta SPA si se provee FrontendUrl
if ($frontend) {
    try {
        $home = Invoke-WebRequest -Method Get -Uri "$frontend/" -UseBasicParsing -TimeoutSec 30
        if ($home.StatusCode -eq 200) { Pass "Frontend / respondio HTTP 200" } else { Fail "Frontend / status: $($home.StatusCode)" }
    } catch {
        Fail "Fallo la solicitud a Frontend /: $($_.Exception.Message)"
    }

    try {
        $adminRoute = Invoke-WebRequest -Method Get -Uri "$frontend/admin" -UseBasicParsing -TimeoutSec 30
        if ($adminRoute.StatusCode -eq 200) { Pass "La ruta Frontend /admin respondio HTTP 200 (rewrite SPA OK)" } else { Fail "Frontend /admin status: $($adminRoute.StatusCode)" }
    } catch {
        Fail "Fallo la solicitud a Frontend /admin (posible problema de rewrite): $($_.Exception.Message)"
    }

    # 3) Preflight CORS basico desde origen frontend hacia backend
    try {
        $preflightHeaders = @{
            Origin                         = $frontend
            "Access-Control-Request-Method"  = "GET"
            "Access-Control-Request-Headers" = "authorization,content-type"
        }
        $preflight = Invoke-WebRequest -Method Options -Uri "$backend/api/vehiculos" -Headers $preflightHeaders -UseBasicParsing -TimeoutSec 30
        $allowOrigin = $preflight.Headers["Access-Control-Allow-Origin"]
        if ($allowOrigin -and ($allowOrigin -eq "*" -or $allowOrigin -eq $frontend)) {
            Pass "El preflight CORS permite el origen del frontend ($allowOrigin)"
        } else {
            Fail "La respuesta de preflight CORS no permite el origen del frontend. Access-Control-Allow-Origin: '$allowOrigin'"
        }
    } catch {
        Fail "Fallo el preflight CORS: $($_.Exception.Message)"
    }
}

# 4) Flujo de auth y endpoints protegidos (opcional, requiere credenciales)
$token = $null
if ($AdminCedula -and $AdminPassword) {
    try {
        $loginBody = @{
            Cedula   = $AdminCedula
            Password = $AdminPassword
        } | ConvertTo-Json

        $login = Invoke-RestMethod -Method Post -Uri "$backend/api/usuarios/login" -ContentType "application/json" -Body $loginBody -TimeoutSec 30
        if ($login.token) {
            $token = $login.token
            Pass "Login admin OK (token recibido)"
        } else {
            Fail "El login respondio sin token"
        }
    } catch {
        Fail "Fallo el login admin: $($_.Exception.Message)"
    }

    if ($token) {
        $authHeaders = @{ Authorization = "Bearer $token" }

        try {
            $u = Invoke-WebRequest -Method Get -Uri "$backend/api/usuarios" -Headers $authHeaders -UseBasicParsing -TimeoutSec 30
            if ($u.StatusCode -eq 200) { Pass "GET /api/usuarios OK con token admin" } else { Fail "GET /api/usuarios status: $($u.StatusCode)" }
        } catch {
            Fail "GET /api/usuarios fallo con token admin: $($_.Exception.Message)"
        }

        try {
            $r = Invoke-WebRequest -Method Get -Uri "$backend/api/reservaciones" -Headers $authHeaders -UseBasicParsing -TimeoutSec 30
            if ($r.StatusCode -eq 200) { Pass "GET /api/reservaciones OK con token admin" } else { Fail "GET /api/reservaciones status: $($r.StatusCode)" }
        } catch {
            Fail "GET /api/reservaciones fallo con token admin: $($_.Exception.Message)"
        }
    }
} else {
    Write-Host "[INFO] No se proporcionaron credenciales de admin; se omiten pruebas de autenticacion."
}

if ($failed) {
    Write-Host "Las pruebas de humo finalizaron con errores." -ForegroundColor Red
    exit 1
}

Write-Host "Las pruebas de humo finalizaron correctamente." -ForegroundColor Green
exit 0
