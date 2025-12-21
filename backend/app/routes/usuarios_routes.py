from flask import Blueprint, request, jsonify
from app.controladores.controladores_usuarios import listar_controlador_usuarios, obtener_controlador_usuarios, crear_controlador_usuario, actualizar_controlador_usuario, eliminar_controlador_usuario, login_controlador_usuario

bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')

@bp.route('', methods=['GET'])
def obtener_usuarios():
    return listar_controlador_usuarios()

@bp.route('/<int:id_usuario>', methods=['GET'])
def obtener_usuario(id_usuario):
    return obtener_controlador_usuarios(id_usuario)

@bp.route('', methods=['POST'])
def inserte_usuario():
    data = request.get_json()
    return crear_controlador_usuario(data)

@bp.route('/<int:id_usuario>', methods=['PUT'])
def actualizar_usuario(id_usuario):
    return actualizar_controlador_usuario(id_usuario)

@bp.route('/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    return eliminar_controlador_usuario(id_usuario)

@bp.route('/login', methods=['POST'])
def login_usuario():
    return login_controlador_usuario()