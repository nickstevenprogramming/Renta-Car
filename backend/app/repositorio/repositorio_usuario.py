from app.db import get_conexion
import pyodbc

def obtener_usuarios(limite=50):
    try:
        limite = int(limite)
    except Exception:
        limite = 50
    if limite <= 0:
        limite = 50
    if limite > 1000:
        limite = 1000
    
    conexion = get_conexion()
    try:
        cursor = conexion.cursor()
        consulta = "SELECT TOP (?) ID_Usuario, Nombre, Apellido, Cedula, Correo_Electronico, Telefono FROM USUARIOS ORDER BY ID_Usuario DESC"
        cursor.execute(consulta, (limite,))
        columnas = [columna[0] for columna in cursor.description] if cursor.description else []
        filas = cursor.fetchall()
        return [dict(zip(columnas, fila)) for fila in filas] if columnas else []
    except Exception as e:
        print(f"Error al obtener usuarios: {str(e)}")
        return []
    finally:
        conexion.close()

def obtener_usuario(id_usuario):
    conexion = get_conexion()
    try:
        cursor = conexion.cursor()
        consulta = "SELECT ID_Usuario, Nombre, Apellido, Cedula, Correo_Electronico, Telefono FROM USUARIOS WHERE ID_Usuario = ?"
        cursor.execute(consulta, (id_usuario,))
        columnas = [columna[0] for columna in cursor.description] if cursor.description else []
        fila = cursor.fetchone()
        return dict(zip(columnas, fila)) if fila and columnas else None
    except Exception as e:
        print(f"Error al obtener usuario {id_usuario}: {str(e)}")
        return None
    finally:
        conexion.close()

def obtener_usuarios_por_cedula(cedula):
    conexion = get_conexion()
    try:
        cursor = conexion.cursor()
        cursor.execute("SELECT * FROM USUARIOS WHERE Cedula = ?", (cedula,))
        fila = cursor.fetchone()
        if not fila:
            return None
        columnas = [col[0] for col in cursor.description]
        return dict(zip(columnas, fila))
    finally:
        conexion.close()

def obtener_usuarios_por_correo(correo):
    conexion = get_conexion()
    try:
        cursor = conexion.cursor()
        cursor.execute("SELECT 1 FROM USUARIOS WHERE Correo_Electronico = ?", (correo,))
        return cursor.fetchone() is not None
    finally:
        conexion.close()

def inserte_usuario(data):
    conexion = get_conexion()
    try:
        cursor = conexion.cursor()
        sql = """
            INSERT INTO USUARIOS (Cedula, Nombre, Apellido, Direccion, Telefono, Correo_Electronico, Licencia_Conducir, Password, esAdmin)
            OUTPUT INSERTED.ID_Usuario, INSERTED.Cedula, INSERTED.Nombre, INSERTED.Apellido, INSERTED.Direccion, INSERTED.Telefono, INSERTED.Correo_Electronico, INSERTED.Licencia_Conducir, INSERTED.esAdmin
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(sql, (
            data['Cedula'],
            data['Nombre'],
            data['Apellido'],
            data['Direccion'],
            data['Telefono'],
            data['Correo_Electronico'],
            data['Licencia_Conducir'],
            data['Password'],  # Ya viene hasheada del controlador
            data.get('esAdmin', 0)
        ))
        row = cursor.fetchone()
        if row:
            columnas = ['ID_Usuario', 'Cedula', 'Nombre', 'Apellido', 'Direccion', 'Telefono', 'Correo_Electronico', 'Licencia_Conducir', 'esAdmin']
            usuario = dict(zip(columnas, row))
            conexion.commit()
            return True, usuario
        else:
            conexion.rollback()
            return False, "No se pudo insertar el usuario"
    except pyodbc.IntegrityError as e:
        conexion.rollback()
        error_msg = str(e)
        if "Violation of UNIQUE KEY constraint" in error_msg or "Cannot insert duplicate key" in error_msg:
            if "Cedula" in error_msg:
                return False, "Ya existe un usuario registrado con esta Cédula."
            elif "Correo_Electronico" in error_msg or "Correo" in error_msg:
                return False, "Ya existe un usuario registrado con este Correo Electrónico."
            elif "Licencia" in error_msg:
                return False, "Ya existe un usuario registrado con esta Licencia."
            else:
                return False, "Ya existe un usuario con estos datos únicos."
        return False, f"Error de integridad en la base de datos."
    except Exception as e:
        conexion.rollback()
        return False, f"Error del sistema: {str(e)}"
    finally:
        conexion.close()
        
def actualizar_usuario(id_usuario, data):
    conexion = get_conexion()
    try:
        cursor = conexion.cursor()
        set_clause = []
        params = []
        for key, value in data.items():
            set_clause.append(f"{key} = ?")
            params.append(value)
        params.append(id_usuario)
        if set_clause:
            cursor.execute(f"UPDATE USUARIOS SET {', '.join(set_clause)} WHERE ID_Usuario = ?", params)
            conexion.commit()
            return cursor.rowcount == 1, "Usuario actualizado"
        return False, "No hay datos para actualizar"
    except Exception as e:
        conexion.rollback()
        return False, str(e)
    finally:
        conexion.close()

def eliminar_usuario(id_usuario):
    conexion = get_conexion()
    try:
        cursor = conexion.cursor()
        cursor.execute("DELETE FROM USUARIOS WHERE ID_Usuario = ?", (id_usuario,))
        conexion.commit()
        return cursor.rowcount == 1, "Usuario eliminado"
    except Exception as e:
        conexion.rollback()
        return False, str(e)
    finally:
        conexion.close()