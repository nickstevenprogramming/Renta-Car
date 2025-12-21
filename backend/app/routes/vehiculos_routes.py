from flask import Blueprint, current_app, request, jsonify, send_file
import os
from app.utils.file_utils import allowed_file, unique_filename
from app.repositorio.repositorio_vehiculos import inserte_vehiculo

from app.controladores.controladores_vehiculos import (
    listar_vehiculos,
    obtener_vehiculo,
    actualizar_vehiculo,
    eliminar_vehiculo,
    reset_vehiculos
)

bp = Blueprint('vehiculos', __name__, url_prefix='/api/vehiculos')

@bp.route('', methods=['POST'])
def crear_vehiculo_con_imagen():
    try:
        marca = request.form.get('Marca')
        modelo = request.form.get('Modelo')
        anio = request.form.get('Año')
        tipo = request.form.get('Tipo')
        precio = request.form.get('Precio')
        color = request.form.get('Color')
        capacidad = request.form.get('CapacidadPasajeros')

        required = ['Marca', 'Modelo', 'Año', 'Tipo', 'Precio']
        for campo in required:
            if not request.form.get(campo):
                return jsonify({"error": f"Falta campo {campo}"}), 400

        imagen_file = (
            request.files.get('imagen') or
            request.files.get('Imagen') or
            request.files.get('ImagenUrl') or
            request.files.get('file')
        )

        current_app.logger.info(f"archivo recibido: {bool(imagen_file)}; keys_files={list(request.files.keys())}")

        imagen_url = None

        if imagen_file:
            filename_orig = getattr(imagen_file, 'filename', None)
            current_app.logger.info(f"filename recibido: {filename_orig}")

            if not filename_orig:
                return jsonify({"error": "Archivo sin nombre"}), 400

            if not allowed_file(filename_orig, current_app.config.get('ALLOWED_EXTENSIONS', set())):
                return jsonify({"error": f"Extensión no permitida: {filename_orig}"}), 400

            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)

            filename = unique_filename(filename_orig)
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            imagen_file.save(save_path)
            current_app.logger.info(f"archivo guardado en: {save_path}")

            imagen_url = f"/static/uploads/{filename}"

        payload = {
            "Marca": marca,
            "Modelo": modelo,
            "Año": anio,
            "Tipo": tipo,
            "Precio": float(precio) if precio else 0,
            "Color": color,
            "CapacidadPasajeros": int(capacidad) if capacidad else None,
            "ImagenUrl": imagen_url
        }

        nuevo_id = inserte_vehiculo(payload)
        if not nuevo_id:
            return jsonify({"error": "No se pudo insertar vehículo"}), 500

        return jsonify({"id": int(nuevo_id), "message": "Vehiculo agregado exitosamente", "ImagenUrl": imagen_url}), 201

    except Exception as e:
        current_app.logger.exception("Error crear vehiculo")
        return jsonify({"error": "Error interno", "details": str(e)}), 500

bp.route('', methods=['GET'])(listar_vehiculos)
bp.route('/<int:id_vehiculo>', methods=['GET'])(obtener_vehiculo)
bp.route('/<int:id_vehiculo>', methods=['PUT'])(actualizar_vehiculo)
bp.route('/<int:id_vehiculo>', methods=['DELETE'])(eliminar_vehiculo)
bp.route('/reset-all', methods=['DELETE'])(reset_vehiculos)
