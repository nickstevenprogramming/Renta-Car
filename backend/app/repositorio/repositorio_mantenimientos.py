"""
Repositorio para la tabla Mantenimientos
Maneja operaciones CRUD para registro de mantenimiento de vehículos
"""
from ..db import get_conexion


def obtener_mantenimientos(limite=100):
    """Obtiene todos los mantenimientos con límite opcional"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = f"""
            SELECT TOP {int(limite)}
                m.ID_Mantenimiento,
                m.ID_Vehiculo,
                m.Descripcion,
                m.Costo,
                m.Fecha_Inicio,
                m.Fecha_Fin,
                m.Estado,
                v.Marca,
                v.Modelo
            FROM Mantenimientos m
            JOIN VEHICULOS v ON m.ID_Vehiculo = v.ID_Vehiculo
            ORDER BY m.Fecha_Inicio DESC
        """
        cursor.execute(sql)
        
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_mantenimientos: {e}")
        return []
    finally:
        conn.close()


def obtener_mantenimiento_por_id(id_mantenimiento):
    """Obtiene un mantenimiento específico por su ID"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = """
            SELECT 
                m.ID_Mantenimiento,
                m.ID_Vehiculo,
                m.Descripcion,
                m.Costo,
                m.Fecha_Inicio,
                m.Fecha_Fin,
                m.Estado,
                v.Marca,
                v.Modelo
            FROM Mantenimientos m
            JOIN VEHICULOS v ON m.ID_Vehiculo = v.ID_Vehiculo
            WHERE m.ID_Mantenimiento = ?
        """
        cursor.execute(sql, (id_mantenimiento,))
        
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            fila = cursor.fetchone()
            if fila:
                return dict(zip(columnas, fila))
        return None
    except Exception as e:
        print(f"Error obtener_mantenimiento_por_id: {e}")
        return None
    finally:
        conn.close()


def obtener_mantenimientos_por_vehiculo(id_vehiculo):
    """Obtiene todos los mantenimientos de un vehículo específico"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = """
            SELECT 
                ID_Mantenimiento,
                ID_Vehiculo,
                Descripcion,
                Costo,
                Fecha_Inicio,
                Fecha_Fin,
                Estado
            FROM Mantenimientos
            WHERE ID_Vehiculo = ?
            ORDER BY Fecha_Inicio DESC
        """
        cursor.execute(sql, (id_vehiculo,))
        
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_mantenimientos_por_vehiculo: {e}")
        return []
    finally:
        conn.close()


def obtener_mantenimientos_activos():
    """Obtiene todos los mantenimientos en progreso"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = """
            SELECT 
                m.ID_Mantenimiento,
                m.ID_Vehiculo,
                m.Descripcion,
                m.Costo,
                m.Fecha_Inicio,
                m.Estado,
                v.Marca,
                v.Modelo
            FROM Mantenimientos m
            JOIN VEHICULOS v ON m.ID_Vehiculo = v.ID_Vehiculo
            WHERE m.Estado = 'En Progreso'
            ORDER BY m.Fecha_Inicio DESC
        """
        cursor.execute(sql)
        
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_mantenimientos_activos: {e}")
        return []
    finally:
        conn.close()


def insertar_mantenimiento(data):
    """
    Inserta un nuevo registro de mantenimiento
    data: dict con ID_Vehiculo, Descripcion (opcional), Costo (opcional)
    """
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO Mantenimientos (ID_Vehiculo, Descripcion, Costo, Estado)
            OUTPUT INSERTED.ID_Mantenimiento, INSERTED.ID_Vehiculo, INSERTED.Descripcion,
                   INSERTED.Costo, INSERTED.Fecha_Inicio, INSERTED.Estado
            VALUES (?, ?, ?, 'En Progreso')
        """
        cursor.execute(sql, (
            data['ID_Vehiculo'],
            data.get('Descripcion', ''),
            data.get('Costo', 0)
        ))
        
        row = cursor.fetchone()
        if row:
            columnas = ['ID_Mantenimiento', 'ID_Vehiculo', 'Descripcion', 'Costo', 'Fecha_Inicio', 'Estado']
            conn.commit()
            return True, dict(zip(columnas, row))
        
        conn.rollback()
        return False, "No se pudo insertar el mantenimiento"
    except Exception as e:
        conn.rollback()
        print(f"Error insertar_mantenimiento: {e}")
        return False, str(e)
    finally:
        conn.close()


def finalizar_mantenimiento(id_mantenimiento, costo_final=None):
    """
    Finaliza un mantenimiento estableciendo Fecha_Fin y Estado = 'Completado'
    Opcionalmente actualiza el costo final
    """
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        
        if costo_final is not None:
            sql = """
                UPDATE Mantenimientos 
                SET Estado = 'Completado', Fecha_Fin = GETDATE(), Costo = ?
                WHERE ID_Mantenimiento = ?
            """
            cursor.execute(sql, (costo_final, id_mantenimiento))
        else:
            sql = """
                UPDATE Mantenimientos 
                SET Estado = 'Completado', Fecha_Fin = GETDATE()
                WHERE ID_Mantenimiento = ?
            """
            cursor.execute(sql, (id_mantenimiento,))
        
        affected = cursor.rowcount
        if affected == 1:
            conn.commit()
            return True, "Mantenimiento finalizado"
        
        conn.rollback()
        return False, "Mantenimiento no encontrado"
    except Exception as e:
        conn.rollback()
        print(f"Error finalizar_mantenimiento: {e}")
        return False, str(e)
    finally:
        conn.close()


def cancelar_mantenimiento(id_mantenimiento):
    """Cancela un mantenimiento estableciendo Estado = 'Cancelado'"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = """
            UPDATE Mantenimientos 
            SET Estado = 'Cancelado', Fecha_Fin = GETDATE()
            WHERE ID_Mantenimiento = ?
        """
        cursor.execute(sql, (id_mantenimiento,))
        
        affected = cursor.rowcount
        if affected == 1:
            conn.commit()
            return True, "Mantenimiento cancelado"
        
        conn.rollback()
        return False, "Mantenimiento no encontrado"
    except Exception as e:
        conn.rollback()
        print(f"Error cancelar_mantenimiento: {e}")
        return False, str(e)
    finally:
        conn.close()


def eliminar_mantenimiento(id_mantenimiento):
    """Elimina un mantenimiento por su ID"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Mantenimientos WHERE ID_Mantenimiento = ?", (id_mantenimiento,))
        
        affected = cursor.rowcount
        if affected == 1:
            conn.commit()
            return True, "Mantenimiento eliminado"
        
        conn.rollback()
        return False, "Mantenimiento no encontrado"
    except Exception as e:
        conn.rollback()
        print(f"Error eliminar_mantenimiento: {e}")
        return False, str(e)
    finally:
        conn.close()
