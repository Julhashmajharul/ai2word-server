"""
Subscription model — MongoDB document operations.
Plans: free, payg, 7day, 1month, 1year, enterprise.
"""
from datetime import datetime, timezone, timedelta
from config.database import get_db

# Plan definitions (price, duration, credits)
PLANS = {
    "payg": {
        "name": "Pay-As-You-Go",
        "price": 1.00,
        "period": "per 1,000 words",
        "duration_days": None,  # No expiration
        "credits": None,        # Calculated per purchase
    },
    "7day": {
        "name": "7 Days",
        "price": 3.00,
        "period": "7 days",
        "duration_days": 7,
        "credits": 999999,  # Unlimited
    },
    "1month": {
        "name": "1 Month",
        "price": 5.00,
        "period": "1 month",
        "duration_days": 30,
        "credits": 999999,
    },
    "1year": {
        "name": "1 Year",
        "price": 20.00,
        "period": "1 year",
        "duration_days": 365,
        "credits": 999999,
    },
    "enterprise": {
        "name": "Enterprise",
        "price": None,  # Custom pricing
        "period": "custom",
        "duration_days": None,
        "credits": None,
    },
}


def get_all_plans() -> dict:
    """Return all available plans."""
    return PLANS


def create_subscription(user_id: str, plan_id: str, payment_id: str = None) -> dict:
    """Create a new subscription record."""
    db = get_db()
    plan = PLANS.get(plan_id)
    if not plan:
        raise ValueError(f"Invalid plan: {plan_id}")

    now = datetime.now(timezone.utc)
    expires_at = None
    if plan["duration_days"]:
        expires_at = now + timedelta(days=plan["duration_days"])

    doc = {
        "user_id": user_id,
        "plan": plan_id,
        "status": "active",
        "credits_purchased": plan.get("credits") or 0,
        "amount_paid": plan.get("price") or 0,
        "started_at": now,
        "expires_at": expires_at,
        "payment_id": payment_id,
    }

    result = db.subscriptions.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


def get_active_subscription(user_id: str) -> dict | None:
    """Get the user's currently active subscription (if any)."""
    db = get_db()
    now = datetime.now(timezone.utc)

    sub = db.subscriptions.find_one({
        "user_id": user_id,
        "status": "active",
        "$or": [
            {"expires_at": {"$gt": now}},
            {"expires_at": None},
        ],
    }, sort=[("started_at", -1)])

    if sub:
        sub["_id"] = str(sub["_id"])
    return sub
