"""
JWT Authentication utilities for Renta-Car API
Provides token generation, verification, and route protection decorators
"""
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from app.config import JWT_SECRET

JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))


def generate_token(user_id, es_admin=False):
    """
    Generates a JWT token for authenticated user
    
    Args:
        user_id: The user's ID
        es_admin: Boolean indicating if user is admin
    
    Returns:
        str: JWT token
    """
    payload = {
        'user_id': user_id,
        'es_admin': bool(es_admin),
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token):
    """
    Verifies and decodes a JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        dict: Decoded payload or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_token_from_request():
    """
    Extracts JWT token from Authorization header
    Expected format: "Bearer <token>"
    
    Returns:
        str: Token or None
    """
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header[7:]
    return None


def require_auth(f):
    """
    Decorator to protect routes - requires valid JWT token
    Adds 'current_user' to request context
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        
        if not token:
            return jsonify({'error': 'Token de autenticación requerido'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        
        # Add user info to request context
        request.current_user = {
            'user_id': payload['user_id'],
            'es_admin': payload['es_admin']
        }
        
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    """
    Decorator to protect admin-only routes
    Requires valid JWT token AND es_admin = True
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        
        if not token:
            return jsonify({'error': 'Token de autenticación requerido'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        
        if not payload.get('es_admin'):
            return jsonify({'error': 'Acceso denegado. Se requieren permisos de administrador'}), 403
        
        # Add user info to request context
        request.current_user = {
            'user_id': payload['user_id'],
            'es_admin': payload['es_admin']
        }
        
        return f(*args, **kwargs)
    return decorated
