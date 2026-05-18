"""
Auth routes — signup, Google auth, profile CRUD, page setup.
"""
from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import require_auth
from models.user import (
    create_user, get_user_by_uid, get_user_by_email,
    update_user, update_page_setup,
)
from utils.email_validator import validate_email_domain

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/signup", methods=["POST"])
@require_auth
def signup():
    """Register a new user after Firebase auth. Validates email domain."""
    data = request.get_json(force=True)
    email = data.get("email", "").strip().lower()

    # Validate email domain (block disposable addresses)
    valid, reason = validate_email_domain(email)
    if not valid:
        return jsonify({"error": reason}), 400

    # Check if user already exists
    existing = get_user_by_uid(g.firebase_user["uid"])
    if existing:
        return jsonify({"user": existing, "message": "User already exists."}), 200

    # Create new user with 1000 free credits
    user_data = {
        "firebase_uid": g.firebase_user["uid"],
        "name": data.get("name", ""),
        "email": email,
        "phone": data.get("phone", ""),
        "occupation": data.get("occupation", ""),
        "gender": data.get("gender", ""),
        "country": data.get("country", ""),
        "auth_provider": data.get("auth_provider", "email"),
    }

    try:
        user = create_user(user_data)
        return jsonify({"user": user, "message": "Account created successfully!"}), 201
    except Exception as e:
        if "duplicate key" in str(e).lower():
            return jsonify({"error": "An account with this email already exists."}), 409
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/google", methods=["POST"])
@require_auth
def google_auth():
    """Register or retrieve a Google OAuth user."""
    data = request.get_json(force=True)

    existing = get_user_by_uid(g.firebase_user["uid"])
    if existing:
        return jsonify({"user": existing, "message": "Welcome back!"}), 200

    user_data = {
        "firebase_uid": g.firebase_user["uid"],
        "name": data.get("name", ""),
        "email": g.firebase_user.get("email", data.get("email", "")),
        "phone": "",
        "occupation": "",
        "gender": "",
        "country": "",
        "auth_provider": "google",
    }

    try:
        user = create_user(user_data)
        return jsonify({"user": user, "message": "Account created via Google!"}), 201
    except Exception as e:
        if "duplicate key" in str(e).lower():
            # Race condition: user was created between the check and insert
            existing = get_user_by_uid(g.firebase_user["uid"])
            return jsonify({"user": existing, "message": "Welcome back!"}), 200
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/me", methods=["GET"])
@require_auth
def get_me():
    """Get the currently authenticated user's profile."""
    user = get_user_by_uid(g.firebase_user["uid"])
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user}), 200


@auth_bp.route("/profile", methods=["PUT"])
@require_auth
def update_profile():
    """Update profile fields (name, phone, occupation, gender, country)."""
    data = request.get_json(force=True)
    allowed_fields = {"name", "phone", "occupation", "gender", "country"}
    updates = {k: v for k, v in data.items() if k in allowed_fields}

    if not updates:
        return jsonify({"error": "No valid fields to update."}), 400

    success = update_user(g.firebase_user["uid"], updates)
    if success:
        user = get_user_by_uid(g.firebase_user["uid"])
        return jsonify({"user": user, "message": "Profile updated."}), 200
    return jsonify({"error": "Update failed."}), 500


@auth_bp.route("/page-setup", methods=["PUT"])
@require_auth
def save_page_setup():
    """Save the user's default page setup preferences."""
    data = request.get_json(force=True)

    success = update_page_setup(g.firebase_user["uid"], data)
    if success:
        return jsonify({"message": "Page setup saved."}), 200
    return jsonify({"error": "Failed to save page setup."}), 500
