from flask import Blueprint, jsonify
from app.repositorio.repositorio_catalogos import obtener_sucursales

bp = Blueprint('sucursales', __name__, url_prefix='/api/sucursales')

@bp.route('', methods=['GET'])
def listar_sucursales():
    try:
        data = obtener_sucursales()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error listar_sucursales: {e}")
        return jsonify({"error": "Error interno"}), 500
