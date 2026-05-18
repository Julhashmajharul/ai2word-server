"""
Credit routes — balance check, deduction.
"""
from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import require_auth
from models.user import get_user_by_uid, deduct_credits
from models.history import calculate_credits, create_history_entry

credits_bp = Blueprint("credits", __name__, url_prefix="/api/credits")


@credits_bp.route("", methods=["GET"])
@require_auth
def get_balance():
    """Get the user's current credit balance."""
    user = get_user_by_uid(g.firebase_user["uid"])
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({
        "credits": user.get("credits", 0),
        "total_credits_used": user.get("total_credits_used", 0),
    }), 200


@credits_bp.route("/deduct", methods=["POST"])
@require_auth
def deduct():
    """
    Deduct credits after a conversion.
    Expects: { "word_count": int, "markdown_text": str (optional, for history) }
    """
    data = request.get_json(force=True)
    word_count = int(data.get("word_count", 0))

    if word_count <= 0:
        return jsonify({"error": "Invalid word count."}), 400

    credits_needed = calculate_credits(word_count)
    uid = g.firebase_user["uid"]

    # Atomic deduction
    updated_user = deduct_credits(uid, credits_needed)

    if updated_user is None:
        user = get_user_by_uid(uid)
        return jsonify({
            "error": "Insufficient credits.",
            "credits": user.get("credits", 0) if user else 0,
            "credits_needed": credits_needed,
        }), 402  # Payment Required

    # Save to conversion history
    markdown_text = data.get("markdown_text", "")
    if markdown_text:
        create_history_entry(uid, markdown_text, word_count, credits_needed)

    return jsonify({
        "credits": updated_user["credits"],
        "credits_deducted": credits_needed,
        "total_credits_used": updated_user["total_credits_used"],
        "show_upgrade": updated_user["total_credits_used"] % 100 < credits_needed,
    }), 200
