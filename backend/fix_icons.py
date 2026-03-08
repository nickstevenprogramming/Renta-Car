from app.db import get_conexion

def fix_icons():
    print("Iniciando reparación de iconos...")
    conn = get_conexion()
    try:
        cursor = conn.cursor()
        
        # Updates with N prefix for Unicode support
        updates = [
            ("Asiento de Bebé", "🍼"),
            ("GPS Navegador", "📍"),
            ("Seguro Premium", "🛡️"),
            ("Conductor Adicional", "👤")
        ]
        
        for nombre, icono in updates:
            # Note the use of parameters which pyodbc handles correctly as unicode
            sql = "UPDATE Extras SET Icono = ? WHERE Nombre = ?"
            cursor.execute(sql, (icono, nombre))
            print(f"Actualizado {nombre} -> {icono}")
            
        conn.commit()
        print("¡Reparación completada éxitosamente!")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_icons()
