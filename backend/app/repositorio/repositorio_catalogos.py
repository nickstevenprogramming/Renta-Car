from ..db import get_conexion

def obtener_sucursales():
    """Obtiene lista de sucursales activas"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        # Seleccionar solo las activas, ordenadas por nombre
        sql = "SELECT ID_Sucursal, Nombre, Direccion FROM Sucursales WHERE Activo = 1 ORDER BY Nombre"
        cursor.execute(sql)
        
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            filas = cursor.fetchall()
            return [dict(zip(columnas, fila)) for fila in filas]
        return []
    except Exception as e:
        print(f"Error obtener_sucursales: {e}")
        return []
    finally:
        conn.close()

def obtener_extras():
    """Obtiene lista de extras activos"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = "SELECT ID_Extra, Nombre, Precio, Icono FROM Extras WHERE Activo = 1 ORDER BY Nombre"
        cursor.execute(sql)
        
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            filas = cursor.fetchall()
            return [dict(zip(columnas, fila)) for fila in filas]
        return []
    except Exception as e:
        print(f"Error obtener_extras: {e}")
        return []
    finally:
        conn.close()

def obtener_marcas():
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = "SELECT ID_Marca, Nombre_Marca as Marca FROM Marcas ORDER BY Nombre_Marca"
        cursor.execute(sql)
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_marcas: {e}")
        return []
    finally:
        conn.close()

def obtener_modelos(id_marca=None):
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        if id_marca:
            sql = "SELECT ID_Modelo, Nombre_Modelo as Modelo, ID_Marca FROM Modelos WHERE ID_Marca = ? ORDER BY Nombre_Modelo"
            cursor.execute(sql, (id_marca,))
        else:
            sql = "SELECT ID_Modelo, Nombre_Modelo as Modelo, ID_Marca FROM Modelos ORDER BY Nombre_Modelo"
            cursor.execute(sql)
            
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_modelos: {e}")
        return []
    finally:
        conn.close()

def obtener_tipos():
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = "SELECT ID_Tipo, Nombre_Tipo as Tipo FROM Tipos ORDER BY Nombre_Tipo"
        cursor.execute(sql)
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_tipos: {e}")
        return []
    finally:
        conn.close()

def obtener_colores():
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = "SELECT ID_Color, Nombre_Color as Color FROM Colores ORDER BY Nombre_Color"
        cursor.execute(sql)
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_colores: {e}")
        return []
    finally:
        conn.close()

def obtener_razones_inactivacion():
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = "SELECT * FROM RazonesInactivacion ORDER BY Nombre_Razon"
        cursor.execute(sql)
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_razones_inactivacion: {e}")
        return []
    finally:
        conn.close()
