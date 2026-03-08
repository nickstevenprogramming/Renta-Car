from flask import Blueprint, jsonify
from app.repositorio.repositorio_catalogos import obtener_extras

bp = Blueprint('extras', __name__, url_prefix='/api/extras')

@bp.route('', methods=['GET'])
def listar_extras():
    try:
        data = obtener_extras()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error listar_extras: {e}")
        return jsonify({"error": "Error interno"}), 500
