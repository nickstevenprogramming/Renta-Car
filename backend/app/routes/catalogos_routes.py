from flask import Blueprint, jsonify, request
from app.repositorio.repositorio_catalogos import (
    obtener_marcas,
    obtener_modelos,
    obtener_tipos,
    obtener_colores,
    obtener_razones_inactivacion
)

bp = Blueprint('catalogos', __name__, url_prefix='/api/catalogos')

@bp.route('/marcas', methods=['GET'])
def listar_marcas():
    try:
        data = obtener_marcas()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error listar_marcas: {e}")
        return jsonify({"error": "Error interno"}), 500

@bp.route('/modelos', methods=['GET'])
def listar_modelos():
    try:
        id_marca = request.args.get('id_marca')
        data = obtener_modelos(id_marca)
        return jsonify(data), 200
    except Exception as e:
        print(f"Error listar_modelos: {e}")
        return jsonify({"error": "Error interno"}), 500

@bp.route('/tipos', methods=['GET'])
def listar_tipos():
    try:
        data = obtener_tipos()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error listar_tipos: {e}")
        return jsonify({"error": "Error interno"}), 500

@bp.route('/colores', methods=['GET'])
def listar_colores():
    try:
        data = obtener_colores()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error listar_colores: {e}")
        return jsonify({"error": "Error interno"}), 500

@bp.route('/razones-inactivacion', methods=['GET'])
def listar_razones():
    try:
        data = obtener_razones_inactivacion()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error listar_razones: {e}")
        return jsonify({"error": "Error interno"}), 500
