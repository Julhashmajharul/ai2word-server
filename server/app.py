"""
AI2Word Backend — Flask Application Entry Point
=================================================
Registers all blueprints, initializes Firebase Admin SDK and MongoDB,
configures CORS for the React frontend.
"""
import os
from dotenv import load_dotenv

# Load .env before any other imports that read os.environ
load_dotenv()

from flask import Flask
from flask_cors import CORS

from config.firebase_config import init_firebase
from config.database import get_db

from routes.auth import auth_bp
from routes.credits import credits_bp
from routes.history import history_bp
from routes.plans import plans_bp
from routes.convert import convert_bp


def create_app():
    app = Flask(__name__)

    # --- CORS ---
    cors_origins = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    CORS(app, resources={r"/*": {"origins": [o.strip() for o in cors_origins]}})

    # --- Firebase Admin SDK ---
    init_firebase()

    # --- MongoDB connection (truly lazy — connects on first API request) ---
    # get_db() is called inside route handlers, no need to call here

    # --- Register Blueprints ---
    app.register_blueprint(auth_bp)
    app.register_blueprint(credits_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(plans_bp)
    app.register_blueprint(convert_bp)

    # --- Health check ---
    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "ok", "service": "ai2word-api"}, 200

    return app


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
