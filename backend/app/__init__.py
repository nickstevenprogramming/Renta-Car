import os
from flask import Flask, jsonify
from flask_cors import CORS
from app.routes.vehiculos_routes import bp as vehiculo_bp
from app.routes.usuarios_routes import bp as usuarios_bp
from app.routes.reservaciones_routes import bp as reservacion_bp
from app.routes.sucursales_routes import bp as sucursales_bp
from app.routes.extras_routes import bp as extras_bp
from app.routes.catalogos_routes import bp as catalogos_bp
from app.config import FRONTEND_URL, JWT_SECRET

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    
    # Configure CORS with allowed origins
    # Accepts localhost for development and FRONTEND_URL for production (Vercel)
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Add production frontend URLs (comma separated)
    frontend_urls = [url.strip() for url in (FRONTEND_URL or "").split(",") if url.strip()]
    for url in frontend_urls:
        if url not in allowed_origins:
            allowed_origins.append(url)

    # Optional support for Vercel preview deployments
    if os.getenv("ALLOW_VERCEL_PREVIEWS", "false").lower() == "true":
        allowed_origins.append(r"https://.*\.vercel\.app")
    
    CORS(app, origins=allowed_origins, supports_credentials=True)
    
    # JWT Secret for token signing
    app.config['JWT_SECRET'] = JWT_SECRET
    
    # Email configuration
    app.config['MAIL_SERVER'] = os.getenv('SMTP_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('SMTP_PORT', 587))
    app.config['MAIL_USERNAME'] = os.getenv('SENDER_EMAIL')
    app.config['MAIL_PASSWORD'] = os.getenv('SENDER_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('SENDER_EMAIL')
    app.config['ADMIN_EMAIL'] = os.getenv('ADMIN_EMAIL')

    print("Registrando blueprints...")
    app.register_blueprint(vehiculo_bp)  
    print("Vehiculos blueprint registrado")
    app.register_blueprint(usuarios_bp) 
    print("Usuarios blueprint registrado")
    app.register_blueprint(reservacion_bp)  
    print("Reservaciones blueprint registrado")
    app.register_blueprint(sucursales_bp)
    print("Sucursales blueprint registrado")
    app.register_blueprint(extras_bp)
    print("Extras blueprint registrado")
    app.register_blueprint(catalogos_bp)
    print("Catalogos blueprint registrado")

    # Image upload configuration
    upload_folder = os.path.join(app.root_path, 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_folder
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 MB

    @app.get('/health')
    def health():
        return jsonify({"status": "ok"}), 200
    
    print(f"CORS configurado para: {allowed_origins}")

    return app
