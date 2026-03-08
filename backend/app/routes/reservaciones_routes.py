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
from app.repositorio.repositorio_reservacion import obtener_reservacion_por_id as repo_obtener_reservacion_por_id
from app.utils.auth import require_auth


bp = Blueprint("reservaciones", __name__, url_prefix="/api/reservaciones")


def _authorize_reservacion_access(id_reservacion):
    current = getattr(request, "current_user", {})
    if current.get("es_admin"):
        return None

    try:
        reservacion = repo_obtener_reservacion_por_id(id_reservacion)
    except Exception:
        return jsonify({"error": "Error interno"}), 500
    if not reservacion:
        return jsonify({"error": "Reservación no encontrada"}), 404

    if reservacion.get("ID_Usuario") != current.get("user_id"):
        return jsonify({"error": "Acceso denegado"}), 403
    return None


@bp.route('', methods=['POST'])
@require_auth
def crear_reservacion_route():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    data['ID_Usuario'] = request.current_user['user_id']
    return crear_nueva_reservacion(data)

@bp.route('', methods=['GET'])
@require_auth
def listar_reservaciones():
    current = getattr(request, "current_user", {})
    if not current.get("es_admin"):
        return obtener_reservaciones_usuario(current.get("user_id"))
    id_usuario = request.args.get('id_usuario', type=int)
    if id_usuario:
        return obtener_reservaciones_usuario(id_usuario)
    return obtener_todas_las_reservaciones()

@bp.route('/<int:id_reservacion>', methods=['GET'])
@require_auth
def obtener_reservacion_por_id(id_reservacion):
    denial = _authorize_reservacion_access(id_reservacion)
    if denial:
        return denial
    return obtener_reservacion(id_reservacion)

@bp.route('/<int:id_reservacion>', methods=['PUT'])
@require_auth
def actualizar_reservacion(id_reservacion):
    denial = _authorize_reservacion_access(id_reservacion)
    if denial:
        return denial
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibieron datos en el cuerpo de la solicitud"}), 400
    data['ID_Usuario'] = request.current_user['user_id']
    return actualizar_reservacion_existente(id_reservacion, data)

@bp.route('/<int:id_reservacion>', methods=['DELETE'])
@require_auth
def eliminar_reservacion(id_reservacion):
    denial = _authorize_reservacion_access(id_reservacion)
    if denial:
        return denial
    return eliminar_reservacion_existente(id_reservacion)

@bp.route('/<int:id_reservacion>/pdf', methods=['GET'])
@require_auth
def generar_pdf_reservacion(id_reservacion):
    denial = _authorize_reservacion_access(id_reservacion)
    if denial:
        return denial
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
        return jsonify({"error": "Error interno"}), 500
