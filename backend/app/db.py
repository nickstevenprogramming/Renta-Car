import pyodbc
from .config import BD_CONEXION

def get_conexion():

    try:
        conexion = pyodbc.connect(BD_CONEXION)
        return conexion
    except Exception as e:
        print("Error de conexión a la BD:", e)
        raise