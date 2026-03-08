from flask import Blueprint, request, jsonify
from app.controladores.controladores_usuarios import listar_controlador_usuarios, obtener_controlador_usuarios, crear_controlador_usuario, actualizar_controlador_usuario, eliminar_controlador_usuario, login_controlador_usuario
from app.utils.auth import require_auth, require_admin

bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')

@bp.route('', methods=['GET'])
@require_admin
def obtener_usuarios():
    return listar_controlador_usuarios()

@bp.route('/<int:id_usuario>', methods=['GET'])
@require_auth
def obtener_usuario(id_usuario):
    current = getattr(request, "current_user", {})
    if not current.get("es_admin") and current.get("user_id") != id_usuario:
        return jsonify({"error": "Acceso denegado"}), 403
    return obtener_controlador_usuarios(id_usuario)

@bp.route('', methods=['POST'])
def inserte_usuario():
    data = request.get_json()
    return crear_controlador_usuario(data)

@bp.route('/<int:id_usuario>', methods=['PUT'])
@require_auth
def actualizar_usuario(id_usuario):
    current = getattr(request, "current_user", {})
    if not current.get("es_admin") and current.get("user_id") != id_usuario:
        return jsonify({"error": "Acceso denegado"}), 403
    return actualizar_controlador_usuario(id_usuario)

@bp.route('/<int:id_usuario>', methods=['DELETE'])
@require_auth
def eliminar_usuario(id_usuario):
    current = getattr(request, "current_user", {})
    if not current.get("es_admin") and current.get("user_id") != id_usuario:
        return jsonify({"error": "Acceso denegado"}), 403
    return eliminar_controlador_usuario(id_usuario)

@bp.route('/login', methods=['POST'])
def login_usuario():
    return login_controlador_usuario()
