import sys
import traceback
from pathlib import Path

print("Working dir:", Path(__file__).resolve().parent)
print("Python exe:", sys.executable)

try:
    from app import create_app
except Exception:
    print("ERROR al importar 'create_app' desde 'app':")
    traceback.print_exc()
    raise

app = create_app()

if __name__ == "__main__":
    # Listar todas las rutas registradas
    try:
        rules = sorted([(r.rule, r.endpoint, ",".join(sorted(r.methods))) for r in app.url_map.iter_rules()])
        print("Rutas registradas:")
        for r in rules:
            print("  ", r)
    except Exception:
        print("No se pudo listar reglas de URL:")
        traceback.print_exc()

    app.run(debug=True, host="127.0.0.1", port=5000)
