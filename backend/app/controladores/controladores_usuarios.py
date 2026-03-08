from flask import jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from app.repositorio.repositorio_usuario import (
    obtener_usuarios,
    obtener_usuario,
    inserte_usuario,
    actualizar_usuario,
    eliminar_usuario,
    obtener_usuarios_por_cedula,
    obtener_usuarios_por_correo,
)
from app.utils.auth import generate_token

def listar_controlador_usuarios():
    try:
        usuarios = obtener_usuarios()
        return jsonify(usuarios)
    except Exception as e:
        print(f"Error listar usuarios: {e}")
        return jsonify({"error": "Error interno"}), 500

def obtener_controlador_usuarios(id_usuario):
    try:
        usuario = obtener_usuario(id_usuario)
        if usuario:
            return jsonify(usuario)
        return jsonify({"error": "Usuario no encontrado"}), 404
    except Exception as e:
        print(f"Error obtener usuario {id_usuario}: {e}")
        return jsonify({"error": "Error interno"}), 500

def crear_controlador_usuario(data):
    try:
        requerimiento = ("Cedula", "Nombre", "Apellido", "Direccion", "Telefono", "Correo_Electronico", "Licencia_Conducir", "Password")
        if not all(k in data and data[k] not in (None, "") for k in requerimiento):
            return jsonify({"error": "Faltan datos requeridos", "requerimiento": list(requerimiento)}), 400

        # Verificar unicidad
        if obtener_usuarios_por_cedula(data["Cedula"]):
            return jsonify({"error": "Cédula ya registrada"}), 400
        if obtener_usuarios_por_correo(data["Correo_Electronico"]):
            return jsonify({"error": "Correo electrónico ya registrado"}), 400

        # Hash password
        data["Password"] = generate_password_hash(data["Password"])
        data["esAdmin"] = data.get("esAdmin", 0)

        ok, result = inserte_usuario(data)
        if ok:
            return jsonify(result), 201  # Devuelve el usuario completo
        return jsonify({"error": result}), 400
    except Exception as e:
        print(f"Error al crear usuario: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
    
def actualizar_controlador_usuario(id_usuario):
    try:
        data = request.get_json() or {}
        if "Password" in data:
            data["Password"] = generate_password_hash(data["Password"])
        ok, result = actualizar_usuario(id_usuario, data)
        if ok:
            return jsonify({"mensaje": "Usuario actualizado"}), 200
        return jsonify({"error": result}), 400
    except Exception as e:
        print(f"Error al actualizar usuario: {e}")
        return jsonify({"error": "Error interno"}), 500

def eliminar_controlador_usuario(id_usuario):
    try:
        ok, result = eliminar_usuario(id_usuario)
        if ok:
            return jsonify({"mensaje": "Usuario eliminado"}), 200
        return jsonify({"error": result}), 400
    except Exception as e:
        print(f"Error al eliminar usuario: {e}")
        return jsonify({"error": "Error interno"}), 500

def login_controlador_usuario():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ("Cedula", "Password")):
            return jsonify({"error": "Faltan credenciales"}), 400

        user = obtener_usuarios_por_cedula(data["Cedula"])
        if user and check_password_hash(user["Password"], data["Password"]):
            # Generate JWT token
            token = generate_token(user["ID_Usuario"], user.get("esAdmin", 0))
            
            # Remove password from response
            user.pop("Password", None)
            
            # Return user data with token
            return jsonify({
                "token": token,
                "user": user
            }), 200
        return jsonify({"error": "Credenciales inválidas"}), 401
    except Exception as e:
        print(f"Error al iniciar sesión: {e}")
        return jsonify({"error": "Error interno"}), 500
