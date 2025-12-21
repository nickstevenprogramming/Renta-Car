from flask import jsonify, request, current_app
from werkzeug.utils import secure_filename
import os
from ..repositorio import repositorio_vehiculos

CARPETA_IMAGENES = "guarda/vehiculos"
os.makedirs(CARPETA_IMAGENES, exist_ok=True)

def listar_vehiculos():
    try:
        marca = request.args.get('marca')
        limite = request.args.get('limite', default=50, type=int)
        vehiculos = repositorio_vehiculos.obtener_vehiculos(limite=limite, marca=marca)
        return jsonify(vehiculos), 200
    except Exception as e:
        print("Error al listar vehiculos:", e)
        return jsonify({"error": "Error interno"}), 500
    
def obtener_vehiculo(id_vehiculo):
    try:
        vehiculo = repositorio_vehiculos.obtener_vehiculo_por_id(id_vehiculo)
        if not vehiculo:
            return jsonify({"error": "Vehiculo no encontrado"}), 404
        return jsonify(vehiculo), 200
    except Exception as e:
        print("Error al obtener vehiculo:", e)
        return jsonify({"error": "Error interno"}), 500

def crear_vehiculo():
    try:
        if request.is_json:
            datos = request.get_json()
        else:
            datos = request.form.to_dict()

        requerimiento = ('Marca', 'Modelo', 'CapacidadPasajeros', 'Año', 'Tipo', 'Color', 'Precio', 'Imagen')
        if not all(campo in datos for campo in requerimiento):
            return jsonify({"error": "Faltan datos requeridos"}), 400

        imagen_url = None
        if "imagen" in request.files:
            imagen = request.files["imagen"]
            if imagen.filename != "":
                filename = secure_filename(imagen.filename)
                ruta = os.path.join(CARPETA_IMAGENES, filename)
                imagen.save(ruta)
                imagen_url = ruta  
                datos["Imagen"] = imagen_url

        nuevo_vehiculo = repositorio_vehiculos.inserte_vehiculo(datos)
        if nuevo_vehiculo:
            return jsonify({"message": "Vehiculo agregado exitosamente", "id": nuevo_vehiculo}), 201
        return jsonify({"error": "No se pudo agregar el vehiculo"}), 400
    except Exception as e:
        print("Error al crear vehiculo:", e)
        return jsonify({"error": "Error interno"}), 500





def actualizar_vehiculo(id_vehiculo):
    try:
        if request.is_json:
            datos = request.get_json()
        else:
            datos = request.form.to_dict()

        imagen_ruta = None
        if "imagen" in request.files:
            imagen = request.files["imagen"]
            if imagen.filename != "":
                filename = secure_filename(imagen.filename)
                
                # Usar configuración de Flask
                upload_folder = current_app.config['UPLOAD_FOLDER']
                os.makedirs(upload_folder, exist_ok=True)
                
                ruta_sistema = os.path.join(upload_folder, filename)
                imagen.save(ruta_sistema)
                
                # Generar URL para la BD
                imagen_ruta = f"/static/uploads/{filename}"
                datos["Imagen"] = imagen_ruta

        vehiculo_actualizado = repositorio_vehiculos.actualizar_vehiculo(id_vehiculo, datos, imagen_bytes=imagen_ruta)
        if vehiculo_actualizado:
            return jsonify({"message": "Vehiculo actualizado exitosamente"}), 200
        return jsonify({"error": "No se pudo actualizar el vehiculo"}), 400
    except Exception as e:
        print("Error al actualizar vehiculo:", e)
        return jsonify({"error": "Error interno"}), 500


def eliminar_vehiculo(id_vehiculo):
    try:
        vehiculo_eliminado = repositorio_vehiculos.eliminar_vehiculo(id_vehiculo)
        if vehiculo_eliminado:
            return jsonify({"message": "Vehiculo eliminado"}), 200
        return jsonify({"error": "No se pudo eliminar el vehiculo"}), 400
    except Exception as e:
        print("Error al eliminar vehiculo:", e)
        return jsonify({"error": "Error interno"}), 500

def reset_vehiculos():
    try:
        exito = repositorio_vehiculos.truncate_vehiculos()
        if exito:
            return jsonify({"message": "Todos los vehículos han sido eliminados y los IDs reiniciados."}), 200
        return jsonify({"error": "No se pudo resetear los vehículos"}), 500
    except Exception as e:
        print("Error al resetear vehiculos:", e)
        return jsonify({"error": "Error interno"}), 500