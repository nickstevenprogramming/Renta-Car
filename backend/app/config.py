import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env explicitly so it works from any current working directory.
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")
load_dotenv()

# Azure SQL connection string (production) or local SQL Server (development)
BD_CONEXION = os.getenv("AZURE_SQL_CONNECTIONSTRING") or os.getenv("BD_CONEXION")
if not BD_CONEXION:   
    raise RuntimeError("BD_CONEXION/AZURE_SQL_CONNECTIONSTRING no está configurada")

# JWT Secret - MUST be explicitly configured
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET no está configurado (defínelo en backend/.env o variable de entorno)")

# Frontend URL(s) for CORS (comma-separated)
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
