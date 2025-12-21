from app.repositorio.repositorio_reservacion import obtener_reservaciones, obtener_reservaciones_por_usuario, obtener_reservacion_por_id, crear_reservacion, actualizar_reservacion, eliminar_reservacion, generar_pdf_reservacion
from app.repositorio.repositorio_usuario import inserte_usuario, obtener_usuarios_por_correo, obtener_usuarios_por_cedula
from flask import jsonify, send_file, request
from flask import Response

def obtener_todas_las_reservaciones():
    try:
        reservaciones = obtener_reservaciones()
        return jsonify(reservaciones)
    except Exception as e:
        print(f"Error en controlador obtener_todas_las_reservaciones: {str(e)}")
        return jsonify({"error": str(e)}), 500

def obtener_reservaciones_usuario(id_usuario):
    try:
        reservaciones = obtener_reservaciones_por_usuario(id_usuario)
        return jsonify(reservaciones)
    except Exception as e:
        print(f"Error en controlador obtener_reservaciones_usuario {id_usuario}: {str(e)}")
        return jsonify({"error": str(e)}), 500

def obtener_reservacion(id_reservacion):
    try:
        reservacion = obtener_reservacion_por_id(id_reservacion)
        if reservacion:
            return jsonify(reservacion)
        return jsonify({"error": "Reservación no encontrada"}), 404
    except Exception as e:
        print(f"Error en controlador obtener_reservacion {id_reservacion}: {str(e)}")
        return jsonify({"error": str(e)}), 500

def crear_nueva_reservacion(data):
    try:
        # Lógica de Guest / Creación de Usuario al vuelo
        id_usuario = data.get('ID_Usuario')
        
        # Si no viene ID o es 0/Guest, intentamos registrarlo
        if not id_usuario or str(id_usuario) == '0':
            email = data.get('Correo_Electronico')
            cedula = data.get('Cedula')
            
            if not email or not cedula:
                return jsonify({"error": "Datos de contacto incompletos para reservación sin cuenta"}), 400

            # Validar si existe
            # OJO: Si existe, para simplificar sin login, podríamos RECHAZAR y pedir login 
            # O usar ese ID (inseguro si se permite cualquiera).
            # Por seguridad básica: Si existe, pedir login.
            existe_email = obtener_usuarios_por_correo(email)
            existe_cedula = obtener_usuarios_por_cedula(cedula)
            
            if existe_email or existe_cedula:
                return jsonify({"error": "Ya existe un usuario con este correo o cédula. Por favor inicie sesión."}), 400
                
            # Crear Nuevo Usuario Guest
            nuevo_usuario = {
                "Nombre": data.get('Nombre'),
                "Apellido": data.get('Apellido'),
                "Cedula": cedula,
                "Correo_Electronico": email,
                "Telefono": data.get('Telefono'),
                "Direccion": data.get('Direccion', 'N/A'), # Hero no manda direccion, ponemos N/A
                "Licencia_Conducir": data.get('Licencia_Conducir'),
                "Password": "GuestUser123!", # Password dummy conocido o aleatorio
                "esAdmin": 0
            }
            
            exito, usuario_creado = inserte_usuario(nuevo_usuario)
            if not exito:
                return jsonify({"error": f"Error al registrar usuario temporal: {usuario_creado}"}), 500
                
            data['ID_Usuario'] = usuario_creado['ID_Usuario']
            print(f"Usuario temporal creado: {usuario_creado['ID_Usuario']}")

        resultado = crear_reservacion(data)
        
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
                    
                    # 2. Enviar a mi correo de administración
                    destinatario_admin = "martineznick633@gmail.com"
                    email_enviado_admin = enviar_email_con_pdf(
                        destinatario_admin,
                        f"Nueva Reservación #{id_reservacion} - {reservacion.get('Nombre', '')}",
                        f"<html><body><h1>Nueva Reservación Registrada</h1><p><strong>ID:</strong> {id_reservacion}<br><strong>Cliente:</strong> {reservacion.get('Nombre', '')} {reservacion.get('Apellido', '')}<br><strong>Correo:</strong> {reservacion.get('Correo_Electronico', '')}<br><strong>Monto:</strong> ${reservacion.get('Monto_Reservacion', 0):,.2f}</p></body></html>",
                        pdf_bytes,
                        f"reservacion_{id_reservacion}.pdf"
                    )
                    resultado["email_enviado_admin"] = email_enviado_admin
                    
            except Exception as e:
                resultado["email_error"] = str(e)
            
        return jsonify(resultado), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def actualizar_reservacion_existente(id_reservacion, data):
    try:
        resultado = actualizar_reservacion(id_reservacion, data)
        return jsonify(resultado), 200 if "message" in resultado else 400
    except Exception as e:
        print(f"Error en controlador actualizar_reservacion_existente {id_reservacion}: {str(e)}")
        return jsonify({"error": str(e)}), 500

def eliminar_reservacion_existente(id_reservacion):
    try:
        resultado = eliminar_reservacion(id_reservacion)
        return jsonify(resultado), 200 if "message" in resultado else 400
    except Exception as e:
        print(f"Error en controlador eliminar_reservacion_existente {id_reservacion}: {str(e)}")
        return jsonify({"error": str(e)}), 500

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