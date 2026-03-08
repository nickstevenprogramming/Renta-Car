from app.repositorio.repositorio_reservacion import obtener_reservaciones, obtener_reservaciones_por_usuario, obtener_reservacion_por_id, crear_reservacion, actualizar_reservacion, eliminar_reservacion, generar_pdf_reservacion
from flask import jsonify, request, current_app

def obtener_todas_las_reservaciones():
    try:
        reservaciones = obtener_reservaciones()
        return jsonify(reservaciones)
    except Exception as e:
        print(f"Error en controlador obtener_todas_las_reservaciones: {str(e)}")
        return jsonify({"error": "Error interno"}), 500

def obtener_reservaciones_usuario(id_usuario):
    try:
        reservaciones = obtener_reservaciones_por_usuario(id_usuario)
        return jsonify(reservaciones)
    except Exception as e:
        print(f"Error en controlador obtener_reservaciones_usuario {id_usuario}: {str(e)}")
        return jsonify({"error": "Error interno"}), 500

def obtener_reservacion(id_reservacion):
    try:
        reservacion = obtener_reservacion_por_id(id_reservacion)
        if reservacion:
            return jsonify(reservacion)
        return jsonify({"error": "Reservación no encontrada"}), 404
    except Exception as e:
        print(f"Error en controlador obtener_reservacion {id_reservacion}: {str(e)}")
        return jsonify({"error": "Error interno"}), 500

def crear_nueva_reservacion(data):
    try:
        id_usuario = data.get('ID_Usuario')
        if not id_usuario or int(id_usuario) <= 0:
            return jsonify({"error": "Autenticación requerida para reservar"}), 401

        resultado = crear_reservacion(data)
        if "error" in resultado:
            return jsonify({"error": "No se pudo crear la reservación"}), 400
        
        if "id" in resultado:
            id_reservacion = resultado["id"]
            
            # Genera PDF
            try:
                pdf_bytes = generar_pdf_reservacion(id_reservacion)
                reservacion = obtener_reservacion_por_id(id_reservacion)
                
                if reservacion and pdf_bytes:
                    from app.utils.email_utils import enviar_email_con_pdf
                    
                    # 1. Enviar al usuario
                    destinatario_usuario = reservacion.get('Correo_Electronico', '')
                    if destinatario_usuario:
                        email_enviado_usuario = enviar_email_con_pdf(
                            destinatario_usuario,
                            f"Confirmación Reservación #{id_reservacion}",
                            f"<html><body><h1>Reservación Confirmada</h1><p>Hola {reservacion.get('Nombre', '')}, tu reservación ha sido confirmada.</p></body></html>",
                            pdf_bytes,
                            f"reservacion_{id_reservacion}.pdf"
                        )
                        resultado["email_enviado_usuario"] = email_enviado_usuario
                    
                    admin_email = current_app.config.get('ADMIN_EMAIL')
                    if admin_email:
                        email_enviado_admin = enviar_email_con_pdf(
                            admin_email,
                            f"Nueva Reservación #{id_reservacion} - {reservacion.get('Nombre', '')}",
                            f"<html><body><h1>Nueva Reservación Registrada</h1><p><strong>ID:</strong> {id_reservacion}<br><strong>Cliente:</strong> {reservacion.get('Nombre', '')} {reservacion.get('Apellido', '')}<br><strong>Correo:</strong> {reservacion.get('Correo_Electronico', '')}<br><strong>Monto:</strong> ${reservacion.get('Monto_Reservacion', 0):,.2f}</p></body></html>",
                            pdf_bytes,
                            f"reservacion_{id_reservacion}.pdf"
                        )
                        resultado["email_enviado_admin"] = email_enviado_admin
                    
            except Exception as e:
                print(f"Error enviando correo reservación {id_reservacion}: {e}")
                resultado["email_error"] = "Error al enviar correo"
            
        return jsonify(resultado), 201
        
    except Exception as e:
        print(f"Error crear_nueva_reservacion: {e}")
        return jsonify({"error": "Error interno"}), 500
    
def actualizar_reservacion_existente(id_reservacion, data):
    try:
        resultado = actualizar_reservacion(id_reservacion, data)
        if "message" in resultado:
            return jsonify(resultado), 200
        return jsonify({"error": "No se pudo actualizar la reservación"}), 400
    except Exception as e:
        print(f"Error en controlador actualizar_reservacion_existente {id_reservacion}: {str(e)}")
        return jsonify({"error": "Error interno"}), 500

def eliminar_reservacion_existente(id_reservacion):
    try:
        resultado = eliminar_reservacion(id_reservacion)
        if "message" in resultado:
            return jsonify(resultado), 200
        return jsonify({"error": "No se pudo eliminar la reservación"}), 400
    except Exception as e:
        print(f"Error en controlador eliminar_reservacion_existente {id_reservacion}: {str(e)}")
        return jsonify({"error": "Error interno"}), 500

def obtener_pdf_reservacion(id_reservacion):
    """Genera PDF y devuelve bytes directos"""
    try:
        print(f"[DEBUG] Controlador: Solicitando PDF para reservación {id_reservacion}")
        
        pdf_bytes = generar_pdf_reservacion(id_reservacion)
        
        if not pdf_bytes or len(pdf_bytes) == 0:
            raise Exception("PDF vacío")
        
        print(f"[DEBUG] Controlador: PDF generado ({len(pdf_bytes)} bytes)")
        return pdf_bytes  
        
    except Exception as e:
        print(f"[ERROR] Controlador PDF: {str(e)}")
        raise  
