from ..db import get_conexion


def obtener_vehiculos(limite=50, marca=None):
    conn = get_conexion()
    try:
        cursor = conn.cursor()

        base_fields = "ID_Vehiculo, Marca, Modelo, Año, Tipo, Precio, Color, CapacidadPasajeros, ImagenUrl"
        if marca:
            sql = f"SELECT TOP {int(limite)} {base_fields} FROM VEHICULOS WHERE Marca = ?"
            cursor.execute(sql, (marca,))
        else:
            sql = f"SELECT TOP {int(limite)} {base_fields} FROM VEHICULOS"
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
        INSERT INTO VEHICULOS (Marca, Modelo, Año, Tipo, Precio, Color, CapacidadPasajeros, ImagenUrl)
        OUTPUT INSERTED.ID_Vehiculo
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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