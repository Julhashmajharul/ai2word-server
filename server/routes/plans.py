"""
Plans & subscription routes.
"""
from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import require_auth
from models.subscription import get_all_plans, create_subscription, get_active_subscription
from models.user import add_credits

plans_bp = Blueprint("plans", __name__, url_prefix="/api")


@plans_bp.route("/plans", methods=["GET"])
def list_plans():
    """Get all available pricing plans (public endpoint)."""
    plans = get_all_plans()
    return jsonify({"plans": plans}), 200


@plans_bp.route("/subscribe", methods=["POST"])
@require_auth
def subscribe():
    """
    Subscribe to a plan.
    Expects: { "plan": "7day" | "1month" | "1year" | "payg", "payment_id": "..." }

    NOTE: Payment verification is intentionally NOT implemented here.
    This endpoint creates the subscription record and adds credits.
    Integrate your local payment gateway's webhook/verification before
    calling create_subscription() in production.
    """
    data = request.get_json(force=True)
    plan_id = data.get("plan", "")
    payment_id = data.get("payment_id")

    if plan_id == "enterprise":
        return jsonify({"message": "Please contact sales for enterprise plans."}), 200

    valid_plans = get_all_plans()
    if plan_id not in valid_plans:
        return jsonify({"error": f"Invalid plan: {plan_id}"}), 400

    uid = g.firebase_user["uid"]

    try:
        # TODO: Verify payment with your local payment gateway here
        # For now, we just create the subscription record
        sub = create_subscription(uid, plan_id, payment_id)

        # Add credits for the plan
        plan = valid_plans[plan_id]
        credits = plan.get("credits") or 0
        if credits > 0:
            add_credits(uid, credits)

        return jsonify({
            "subscription": sub,
            "message": f"Subscribed to {plan['name']} plan!",
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
