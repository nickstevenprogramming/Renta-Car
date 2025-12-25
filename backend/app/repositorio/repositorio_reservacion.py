from app.db import get_conexion
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
import os
from datetime import datetime
from PIL import Image as PILImage
import io

def obtener_reservaciones():
    conexion = get_conexion()
    try:
        if conexion is None:
            raise Exception("No se pudo establecer conexión con la base de datos")
        cursor = conexion.cursor()
        consulta = """
            SELECT ID_Reservacion, ID_Vehiculo, ID_Usuario, Monto_Reservacion, Fecha_Reservacion
            FROM RESERVACIONES
        """
        cursor.execute(consulta)
        columnas = [columna[0] for columna in cursor.description] if cursor.description else []
        filas = cursor.fetchall()
        print(f"Reservaciones obtenidas: {len(filas)} registros")
        return [dict(zip(columnas, fila)) for fila in filas] if columnas else []
    except Exception as e:
        print(f"Error al obtener todas las reservaciones: {str(e)}")
        return []
    finally:
        if conexion:
            conexion.close()

def obtener_reservaciones_por_usuario(id_usuario):
    conexion = get_conexion()
    try:
        if conexion is None:
            raise Exception("No se pudo establecer conexión con la base de datos")
        cursor = conexion.cursor()
        consulta = """
            SELECT ID_Reservacion, ID_Vehiculo, ID_Usuario, Monto_Reservacion, Fecha_Reservacion
            FROM RESERVACIONES
            WHERE ID_Usuario = ?
        """
        cursor.execute(consulta, (id_usuario,))
        columnas = [columna[0] for columna in cursor.description] if cursor.description else []
        filas = cursor.fetchall()
        print(f"Reservaciones para usuario {id_usuario}: {len(filas)} registros")
        return [dict(zip(columnas, fila)) for fila in filas] if columnas else []
    except Exception as e:
        print(f"Error al obtener reservaciones para usuario {id_usuario}: {str(e)}")
        return []
    finally:
        if conexion:
            conexion.close()

def obtener_reservacion_por_id(id_reservacion):
    conexion = get_conexion()
    try:
        if conexion is None:
            raise Exception("No se pudo establecer conexión con la base de datos")
        cursor = conexion.cursor()
        consulta = """
            SELECT 
                r.ID_Reservacion, 
                r.ID_Vehiculo, 
                r.ID_Usuario, 
                r.Monto_Reservacion, 
                r.Fecha_Reservacion,
                r.Ubicacion_Entrega,
                r.Ubicacion_Devolucion,
                r.Fecha_Recogida,
                r.Fecha_Devolucion,
                u.Nombre, 
                u.Apellido, 
                u.Correo_Electronico,
                u.Telefono,
                v.Marca, 
                v.Modelo
            FROM RESERVACIONES r
            JOIN USUARIOS u ON r.ID_Usuario = u.ID_Usuario
            JOIN VEHICULOS v ON r.ID_Vehiculo = v.ID_Vehiculo
            WHERE r.ID_Reservacion = ?
        """
        cursor.execute(consulta, (id_reservacion,))
        columnas = [columna[0] for columna in cursor.description] if cursor.description else []
        fila = cursor.fetchone()
        if not fila:
            print(f"Reservación {id_reservacion} no encontrada")
            raise Exception(f"Reservación {id_reservacion} no encontrada")
        resultado = dict(zip(columnas, fila))
        print(f"Reservación {id_reservacion} encontrada: {resultado}")
        return resultado
    except Exception as e:
        print(f"Error al obtener reservación {id_reservacion}: {str(e)}")
        raise
    finally:
        if conexion:
            conexion.close()
            
def crear_reservacion(data):
    conexion = get_conexion()
    try:
        cursor = conexion.cursor()
        
        # Validar datos
        required = ['ID_Vehiculo', 'ID_Usuario', 'Ubicacion_Entrega', 'Fecha_Recogida', 'Fecha_Devolucion', 'Ubicacion_Devolucion', 'Monto_Reservacion']
        missing = [field for field in required if field not in data or data[field] is None]
        if missing:
            raise ValueError(f"Campos faltantes o nulos: {', '.join(missing)}")
        id_vehiculo = int(data['ID_Vehiculo'])
        id_usuario = int(data['ID_Usuario'])
        monto = float(data['Monto_Reservacion'])
        fecha_recogida = datetime.fromisoformat(data['Fecha_Recogida']).date() if data['Fecha_Recogida'] else None
        fecha_devolucion = datetime.fromisoformat(data['Fecha_Devolucion']).date() if data['Fecha_Devolucion'] else None
        
        if fecha_recogida is None or fecha_devolucion is None:
            raise ValueError("Fechas inválidas")
        
        sql = """
        INSERT INTO RESERVACIONES (ID_Vehiculo, ID_Usuario, Ubicacion_Entrega, Fecha_Recogida, Fecha_Devolucion, Ubicacion_Devolucion, Monto_Reservacion)
        OUTPUT INSERTED.ID_Reservacion
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(sql, (
            id_vehiculo,
            id_usuario,
            data['Ubicacion_Entrega'],
            fecha_recogida,
            fecha_devolucion,
            data['Ubicacion_Devolucion'],
            monto
        ))
        
        row = cursor.fetchone()
        if row:
            nuevo_id = int(row[0])
            conexion.commit()
            return {"id": nuevo_id, "message": "Reservación creada"}
        else:
            raise ValueError("No se insertó la reservación")
        
    except Exception as e:
        if conexion:
            conexion.rollback()
        print(f"Error al crear reservación: {str(e)}")
        return {"error": str(e)}
    finally:
        if conexion:
            conexion.close()

def actualizar_reservacion(id_reservacion, data):
    conexion = get_conexion()
    try:
        if conexion is None:
            raise Exception("No se pudo establecer conexión con la base de datos")
        cursor = conexion.cursor()
        consulta = """
            UPDATE RESERVACIONES
            SET ID_Vehiculo = ?, ID_Usuario = ?, Monto_Reservacion = ?, Fecha_Reservacion = ?
            WHERE ID_Reservacion = ?
        """
        cursor.execute(consulta, (
            data.get('ID_Vehiculo'),
            data.get('ID_Usuario'),
            data.get('Monto_Reservacion'),
            data.get('Fecha_Reservacion'),
            id_reservacion
        ))
        conexion.commit()
        print(f"Reservación {id_reservacion} actualizada: {data}")
        return {"message": "Reservación actualizada exitosamente"}
    except Exception as e:
        print(f"Error al actualizar reservación {id_reservacion}: {str(e)}")
        return {"error": str(e)}
    finally:
        if conexion:
            conexion.close()

def eliminar_reservacion(id_reservacion):
    conexion = get_conexion()
    try:
        if conexion is None:
            raise Exception("No se pudo establecer conexión con la base de datos")
        cursor = conexion.cursor()
        consulta = "DELETE FROM RESERVACIONES WHERE ID_Reservacion = ?"
        cursor.execute(consulta, (id_reservacion,))
        conexion.commit()
        print(f"Reservación {id_reservacion} eliminada")
        return {"message": "Reservación eliminada exitosamente"}
    except Exception as e:
        print(f"Error al eliminar reservación {id_reservacion}: {str(e)}")
        return {"error": str(e)}
    finally:
        if conexion:
            conexion.close()

def generar_pdf_reservacion(id_reservacion):
    """Genera un PDF detallado para la reservación dada su ID."""
    try:
        print(f"[DEBUG] Generando PDF heavy para reservación {id_reservacion}")
        
        reservacion = obtener_reservacion_por_id(id_reservacion)
        if not reservacion:
            raise Exception(f"Reservación {id_reservacion} no encontrada")
        
        buffer = BytesIO()
        
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            topMargin=1.5*cm,
            bottomMargin=1.5*cm,
            leftMargin=1.5*cm,
            rightMargin=1.5*cm
        )
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'HeavyTitle',
            parent=styles['Title'],
            fontSize=24,
            textColor=HexColor('#6d28d9'),
            alignment=1,
            spaceAfter=20
        )
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=HexColor('#5b21b6'),
            spaceAfter=10
        )
        
        story = []
        
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads', 'logo4.png')
        if os.path.exists(logo_path):
            try:
                with PILImage.open(logo_path) as img:
                    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                        img = img.convert('RGBA')
                    img = img.resize((550, 90), PILImage.Resampling.LANCZOS)
                    
                    img_buffer = BytesIO()
                    img.save(img_buffer, format='PNG', optimize=True)
                    img_buffer.seek(0)
                    story.append(Image(img_buffer, width=550, height=90))
            except Exception as e:
                print(f"Error logo: {e}")
                story.append(Paragraph("RENTA-CAR", title_style))
        
        story.append(Spacer(1, 10))
        story.append(Paragraph("COMPROBANTE DE RESERVACIÓN", title_style))
        story.append(Paragraph(f"Reservación # {reservacion['ID_Reservacion']}", subtitle_style))
        story.append(Spacer(1, 12))
        
        story.append(Table(
            [['']],
            colWidths=[540],
            rowHeights=[5],
            style=TableStyle([('BACKGROUND', (0,0), (-1,-1), HexColor('#6d28d9'))])
        ))
        story.append(Spacer(1, 15))
        
        fecha_recogida = reservacion.get('Fecha_Recogida', '')
        fecha_devolucion = reservacion.get('Fecha_Devolucion', '')
        
        try:
            if fecha_recogida:
                fecha_recogida = datetime.strptime(str(fecha_recogida), '%Y-%m-%d').strftime('%d/%m/%Y')
        except:
            pass
            
        try:
            if fecha_devolucion:
                fecha_devolucion = datetime.strptime(str(fecha_devolucion), '%Y-%m-%d').strftime('%d/%m/%Y')
        except:
            pass
        
        table_data = [
            ["Campo", "Detalle"],
            ["ID Reservación", str(reservacion['ID_Reservacion'])],
            ["Cliente", f"{reservacion.get('Nombre', '')} {reservacion.get('Apellido', '')}".strip()],
            ["Correo", reservacion.get('Correo_Electronico', 'N/A')],
            ["Teléfono", reservacion.get('Telefono', 'N/A')],
            ["Vehículo", f"{reservacion.get('Marca', '')} {reservacion.get('Modelo', '')}".strip()],
            ["Recogida", reservacion.get('Ubicacion_Entrega', 'N/A')],
            ["Devolución", reservacion.get('Ubicacion_Devolucion', 'N/A')],
            ["Fecha Recogida", fecha_recogida or 'N/A'],
            ["Fecha Devolución", fecha_devolucion or 'N/A'],
            ["Monto Total", f"${float(reservacion.get('Monto_Reservacion', 0)):,.2f}"],
        ]
        
        table = Table(table_data, colWidths=[180, 360])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), HexColor('#6d28d9')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 14),
            ('BACKGROUND', (0,1), (-1,-1), HexColor('#f8f9fa')),
            ('GRID', (0,0), (-1,-1), 1.5, HexColor('#5b21b6')),
            ('BOX', (0,0), (-1,-1), 3, HexColor('#6d28d9')),
            ('FONTSIZE', (0,1), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 15),
            ('RIGHTPADDING', (0,0), (-1,-1), 15),
            ('TOPPADDING', (0,0), (-1,-1), 10),  # Reducido padding vertical
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(table)
        
        # Footer
        story.append(Spacer(1, 20))
        story.append(Paragraph(
            "Gracias por confiar en Renta-Car",
            ParagraphStyle('Thanks', fontSize=14, textColor=HexColor('#6d28d9'), alignment=1)
        ))
        story.append(Spacer(1, 20))
        
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey,
            alignment=1
        )
        story.append(Paragraph("Renta-Car © 2025 | soporte@renta-car.com | +1 (809) 555-0198", footer_style))
        
        # Construccion de PDF
        doc.build(story)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        if not pdf_bytes:
            raise Exception("PDF generado vacío")
            
        print(f"[DEBUG] PDF generado: {len(pdf_bytes)} bytes")
        return pdf_bytes
        
    except Exception as e:
        print(f"[ERROR] generar_pdf_reservacion: {str(e)}")
        raise