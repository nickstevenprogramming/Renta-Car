import pyodbc
from .config import BD_CONEXION

# Extract server name for logging
def _get_server_from_connection_string(conn_str):
    """Extract server name from connection string for logging"""
    if not conn_str:
        return "NONE"
    parts = conn_str.split(';')
    for part in parts:
        if part.lower().startswith('server='):
            return part.split('=', 1)[1]
    return "UNKNOWN"

# Log which database we're connecting to at module load
_server_name = _get_server_from_connection_string(BD_CONEXION)
print("[DB CONFIG] Conexión a base de datos configurada")

# Warn if connecting to local instead of Azure
if 'database.windows.net' not in BD_CONEXION.lower():
    print("[DB CONFIG] ADVERTENCIA: conexión local detectada.")

def get_conexion():
    try:
        conexion = pyodbc.connect(BD_CONEXION)
        return conexion
    except Exception as e:
        print("[DB ERROR] Error de conexión a base de datos.")
        raise
