import os
import sys
import traceback
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend/.env is loaded before importing the Flask app.
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

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

    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(debug=debug_mode, host=host, port=port)
