"""
Conversion history routes.
"""
from flask import Blueprint, jsonify, g
from middleware.auth_middleware import require_auth
from models.history import get_user_history, delete_history_entry

history_bp = Blueprint("history", __name__, url_prefix="/api/history")


@history_bp.route("", methods=["GET"])
@require_auth
def get_history():
    """Get all conversion history for the authenticated user."""
    uid = g.firebase_user["uid"]
    history = get_user_history(uid)
    return jsonify({"history": history}), 200


@history_bp.route("/<entry_id>", methods=["DELETE"])
@require_auth
def delete_entry(entry_id):
    """Manually delete a history entry."""
    uid = g.firebase_user["uid"]
    success = delete_history_entry(uid, entry_id)
    if success:
        return jsonify({"message": "Entry deleted."}), 200
    return jsonify({"error": "Entry not found or already deleted."}), 404
