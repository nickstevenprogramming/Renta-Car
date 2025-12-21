import os
from flask import Flask
from flask_cors import CORS
from app.routes.vehiculos_routes import bp as vehiculo_bp
from app.routes.usuarios_routes import bp as usuarios_bp
from app.routes.reservaciones_routes import bp as reservacion_bp

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    CORS(app)
    
    app.config['MAIL_SERVER'] = os.getenv('SMTP_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('SMTP_PORT', 587))
    app.config['MAIL_USERNAME'] = os.getenv('SENDER_EMAIL')
    app.config['MAIL_PASSWORD'] = os.getenv('SENDER_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('SENDER_EMAIL')

    print("Registrando blueprints...")
    app.register_blueprint(vehiculo_bp)  
    print("Vehiculos blueprint registrado")
    app.register_blueprint(usuarios_bp) 
    print("Usuarios blueprint registrado")
    app.register_blueprint(reservacion_bp)  
    print("Reservaciones blueprint registrado")

    # Configuración de carga de imágenes
    upload_folder = os.path.join(app.root_path, 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_folder
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 MB

    return app