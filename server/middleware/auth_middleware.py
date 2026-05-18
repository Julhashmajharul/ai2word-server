"""
Firebase Auth middleware — verifies ID tokens on protected routes.
"""
from functools import wraps
from flask import request, jsonify, g
from config.firebase_config import verify_token


def require_auth(f):
    """
    Decorator for protected routes.
    Extracts and verifies the Firebase ID token from the Authorization header.
    Stores the decoded token claims in flask.g.firebase_user.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header."}), 401

        id_token = auth_header.split("Bearer ")[1].strip()

        try:
            decoded = verify_token(id_token)
            g.firebase_user = decoded  # Contains uid, email, etc.
        except Exception as e:
            return jsonify({"error": "Invalid or expired token.", "details": str(e)}), 401

        return f(*args, **kwargs)

    return decorated
