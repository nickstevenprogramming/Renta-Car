"""
Repositorio para la tabla Pagos
Maneja operaciones CRUD para pagos de reservaciones
"""
from ..db import get_conexion


def obtener_pagos(limite=100):
    """Obtiene todos los pagos con límite opcional"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = """
            SELECT 
                p.ID_Pago, 
                p.ID_Reservacion, 
                p.Monto, 
                p.Metodo_Pago, 
                p.Estado_Pago, 
                p.Fecha_Pago,
                r.ID_Usuario,
                r.ID_Vehiculo
            FROM Pagos p
            JOIN RESERVACIONES r ON p.ID_Reservacion = r.ID_Reservacion
            ORDER BY p.Fecha_Pago DESC
        """
        cursor.execute(f"SELECT TOP {int(limite)} * FROM ({sql}) AS subq")
        
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_pagos: {e}")
        return []
    finally:
        conn.close()


def obtener_pago_por_id(id_pago):
    """Obtiene un pago específico por su ID"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = """
            SELECT 
                p.ID_Pago, 
                p.ID_Reservacion, 
                p.Monto, 
                p.Metodo_Pago, 
                p.Estado_Pago, 
                p.Fecha_Pago
            FROM Pagos p
            WHERE p.ID_Pago = ?
        """
        cursor.execute(sql, (id_pago,))
        
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            fila = cursor.fetchone()
            if fila:
                return dict(zip(columnas, fila))
        return None
    except Exception as e:
        print(f"Error obtener_pago_por_id: {e}")
        return None
    finally:
        conn.close()


def obtener_pagos_por_reservacion(id_reservacion):
    """Obtiene todos los pagos de una reservación específica"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = """
            SELECT 
                ID_Pago, 
                ID_Reservacion, 
                Monto, 
                Metodo_Pago, 
                Estado_Pago, 
                Fecha_Pago
            FROM Pagos
            WHERE ID_Reservacion = ?
            ORDER BY Fecha_Pago DESC
        """
        cursor.execute(sql, (id_reservacion,))
        
        if cursor.description:
            columnas = [col[0] for col in cursor.description]
            return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
        return []
    except Exception as e:
        print(f"Error obtener_pagos_por_reservacion: {e}")
        return []
    finally:
        conn.close()


def insertar_pago(data):
    """
    Inserta un nuevo pago
    data: dict con ID_Reservacion, Monto, Metodo_Pago (opcional), Estado_Pago (opcional)
    """
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO Pagos (ID_Reservacion, Monto, Metodo_Pago, Estado_Pago)
            OUTPUT INSERTED.ID_Pago, INSERTED.ID_Reservacion, INSERTED.Monto, 
                   INSERTED.Metodo_Pago, INSERTED.Estado_Pago, INSERTED.Fecha_Pago
            VALUES (?, ?, ?, ?)
        """
        cursor.execute(sql, (
            data['ID_Reservacion'],
            data['Monto'],
            data.get('Metodo_Pago', 'Tarjeta'),
            data.get('Estado_Pago', 'Pendiente')
        ))
        
        row = cursor.fetchone()
        if row:
            columnas = ['ID_Pago', 'ID_Reservacion', 'Monto', 'Metodo_Pago', 'Estado_Pago', 'Fecha_Pago']
            conn.commit()
            return True, dict(zip(columnas, row))
        
        conn.rollback()
        return False, "No se pudo insertar el pago"
    except Exception as e:
        conn.rollback()
        print(f"Error insertar_pago: {e}")
        return False, str(e)
    finally:
        conn.close()


def actualizar_estado_pago(id_pago, nuevo_estado):
    """
    Actualiza el estado de un pago
    Estados válidos: Pendiente, Pagado, Reembolsado
    """
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        sql = "UPDATE Pagos SET Estado_Pago = ? WHERE ID_Pago = ?"
        cursor.execute(sql, (nuevo_estado, id_pago))
        
        affected = cursor.rowcount
        if affected == 1:
            conn.commit()
            return True, "Estado de pago actualizado"
        
        conn.rollback()
        return False, "Pago no encontrado"
    except Exception as e:
        conn.rollback()
        print(f"Error actualizar_estado_pago: {e}")
        return False, str(e)
    finally:
        conn.close()


def eliminar_pago(id_pago):
    """Elimina un pago por su ID"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Pagos WHERE ID_Pago = ?", (id_pago,))
        
        affected = cursor.rowcount
        if affected == 1:
            conn.commit()
            return True, "Pago eliminado"
        
        conn.rollback()
        return False, "Pago no encontrado"
    except Exception as e:
        conn.rollback()
        print(f"Error eliminar_pago: {e}")
        return False, str(e)
    finally:
        conn.close()
