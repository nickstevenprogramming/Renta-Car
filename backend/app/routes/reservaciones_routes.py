from flask import Blueprint, request, jsonify, Response
from app.controladores.controladores_reservaciones import (
    obtener_todas_las_reservaciones,
    obtener_reservacion,
    crear_nueva_reservacion,
    actualizar_reservacion_existente,
    eliminar_reservacion_existente,
    obtener_pdf_reservacion,
    obtener_reservaciones_usuario
)


bp = Blueprint("reservaciones", __name__, url_prefix="/api/reservaciones")

@bp.route('', methods=['POST'])
def crear_reservacion_route():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    return crear_nueva_reservacion(data)

@bp.route('', methods=['GET'])
def listar_reservaciones():
    id_usuario = request.args.get('id_usuario', type=int)
    if id_usuario:
        return obtener_reservaciones_usuario(id_usuario)
    return obtener_todas_las_reservaciones()

@bp.route('/<int:id_reservacion>', methods=['GET'])
def obtener_reservacion_por_id(id_reservacion):
    return obtener_reservacion(id_reservacion)

@bp.route('/<int:id_reservacion>', methods=['PUT'])
def actualizar_reservacion(id_reservacion):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibieron datos en el cuerpo de la solicitud"}), 400
    return actualizar_reservacion_existente(id_reservacion, data)

@bp.route('/<int:id_reservacion>', methods=['DELETE'])
def eliminar_reservacion(id_reservacion):
    return eliminar_reservacion_existente(id_reservacion)

@bp.route('/<int:id_reservacion>/pdf', methods=['GET'])
def generar_pdf_reservacion(id_reservacion):
    try:
        pdf_bytes = obtener_pdf_reservacion(id_reservacion)
        
        return Response(
            pdf_bytes,
            status=200,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'inline; filename=reservacion_{id_reservacion}.pdf',
                'Content-Length': str(len(pdf_bytes)),
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            direct_passthrough=True 
        )
        
    except Exception as e:
        print(f"[ERROR] Ruta PDF: {str(e)}")
        return jsonify({"error": str(e)}), 500