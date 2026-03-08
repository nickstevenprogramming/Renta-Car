from ..db import get_conexion


def obtener_vehiculos(limite=50, marca=None):
    conn = get_conexion()
    try:
        cursor = conn.cursor()

        base_fields = """
            V.ID_Vehiculo, V.Marca, V.Modelo, V.Año, V.Tipo, V.Precio, V.Color, 
            V.CapacidadPasajeros, V.ImagenUrl, 
            ISNULL(V.Estado, 'activo') as Estado,
            R.Nombre_Razon as RazonInactivacion
        """
        if marca:
            sql = f"""
                SELECT TOP {int(limite)} {base_fields} 
                FROM VEHICULOS V
                LEFT JOIN RazonesInactivacion R ON V.ID_RazonInactivacion = R.ID_Razon
                WHERE V.Marca = ?
            """
            cursor.execute(sql, (marca,))
        else:
            sql = f"""
                SELECT TOP {int(limite)} {base_fields} 
                FROM VEHICULOS V
                LEFT JOIN RazonesInactivacion R ON V.ID_RazonInactivacion = R.ID_Razon
            """
            cursor.execute(sql)


        columnas = [col[0] for col in cursor.description]
        filas = cursor.fetchall()
        return [dict(zip(columnas, fila)) for fila in filas]
    finally:
        conn.close()

def obtener_vehiculo_por_id(id_vehiculo):
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT ID_Vehiculo, Marca, Modelo, Año, Tipo, Precio, Color, CapacidadPasajeros, ImagenUrl FROM VEHICULOS WHERE ID_Vehiculo = ?", (id_vehiculo,))
        fila = cursor.fetchone()
        if not fila:
            return None
        columnas = [col[0] for col in cursor.description]
        return dict(zip(columnas, fila))
    finally:
        conn.close()

def inserte_vehiculo(data):
    conn = get_conexion()
    try:
        cursor = conn.cursor()

        sql = """
        INSERT INTO VEHICULOS (Marca, Modelo, Año, Tipo, Precio, Color, CapacidadPasajeros, ImagenUrl, Estado)
        OUTPUT INSERTED.ID_Vehiculo
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo')
        """
        cursor.execute(sql, (
            data.get('Marca'),
            data.get('Modelo'),
            data.get('Año'),
            data.get('Tipo'),
            data.get('Precio'),
            data.get('Color'),
            data.get('CapacidadPasajeros'),
            data.get('ImagenUrl')
        ))
        row = cursor.fetchone()
        if row:
            nuevo_id = int(row[0])
            conn.commit()
            return nuevo_id
        conn.rollback()
        return None
    finally:
        conn.close()

def actualizar_vehiculo(id_vehiculo, data, imagen_bytes=None):
    conexion = get_conexion()
    cursor = conexion.cursor()
    if imagen_bytes:
        consulta = "UPDATE VEHICULOS SET Marca=?, Modelo=?, Año=?, Tipo=?, Precio=?, Color=?, CapacidadPasajeros=?, ImagenURL=? WHERE ID_Vehiculo=?"
        valores = (data['Marca'], data['Modelo'], data['Año'], data['Tipo'], data['Precio'], data.get('Color'), data.get('CapacidadPasajeros'), imagen_bytes, id_vehiculo)
    else:
        consulta = "UPDATE VEHICULOS SET Marca=?, Modelo=?, Año=?, Tipo=?, Precio=?, Color=?, CapacidadPasajeros=? WHERE ID_Vehiculo=?"
        valores = (data['Marca'], data['Modelo'], data['Año'], data['Tipo'], data['Precio'], data.get('Color'), data.get('CapacidadPasajeros'), id_vehiculo)

    cursor.execute(consulta, valores)
    affected = cursor.rowcount
    if affected == 1:
        conexion.commit()
    else:
        conexion.rollback()
    conexion.close()
    return affected == 1

def eliminar_vehiculo(id_vehiculo):
    conexion = get_conexion()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM VEHICULOS WHERE ID_Vehiculo = ?", (id_vehiculo,))
    affected = cursor.rowcount
    if affected == 1:
        conexion.commit()
    else:
        conexion.rollback()
    conexion.close()
    return affected == 1

def truncate_vehiculos():
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        # Intentamos TRUNCATE primero, si falla por FKs, usamos DELETE + RESEED
        try:
            cursor.execute("TRUNCATE TABLE VEHICULOS")
        except Exception:
            # Si hay FKs, TRUNCATE falla. Usamos DELETE
            cursor.execute("DELETE FROM VEHICULOS")
            cursor.execute("DBCC CHECKIDENT ('VEHICULOS', RESEED, 0)")
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Error en truncate_vehiculos: {e}")
        conn.rollback()
        return False

def activar_vehiculo(id_vehiculo):
    """Activa un vehículo cambiando su estado a 'activo'"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE VEHICULOS SET Estado = 'activo', ID_RazonInactivacion = NULL WHERE ID_Vehiculo = ?",
            (id_vehiculo,)
        )
        affected = cursor.rowcount
        if affected == 1:
            conn.commit()
            return True
        conn.rollback()
        return False
    except Exception as e:
        print(f"Error al activar vehiculo: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def desactivar_vehiculo(id_vehiculo, id_razon=None):
    """Desactiva un vehículo cambiando su estado a 'inactivo' y guardando la razón"""
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE VEHICULOS SET Estado = 'inactivo', ID_RazonInactivacion = ? WHERE ID_Vehiculo = ?",
            (id_razon, id_vehiculo)
        )
        affected = cursor.rowcount
        if affected == 1:
            conn.commit()
            return True
        conn.rollback()
        return False
    except Exception as e:
        print(f"Error al desactivar vehiculo: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()
