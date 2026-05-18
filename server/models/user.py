"""
User model — MongoDB document operations.
"""
from datetime import datetime, timezone
from config.database import get_db

# Default page setup for new users
DEFAULT_PAGE_SETUP = {
    "font_family": "'Times New Roman', 'bangla', serif",
    "font_size_pt": 12,
    "margin_top_in": 0.5,
    "margin_bottom_in": 0.5,
    "margin_left_in": 0.5,
    "margin_right_in": 0.5,
    "border_style": "none",
    "border_width_px": 1,
    "border_color": "#000000",
    "header_color": "#003366",
    "hr_enabled": True,
    "hr_width": "100%",
    "hr_height": 1,
    "hr_color": "#000000",
    "hr_align": "center",
    "math_align": "center",
    "space_before_pt": 0,
    "space_after_pt": 0,
    "line_spacing": 1,
    "column_count": 1,
}

FREE_CREDITS = 1000


def create_user(data: dict) -> dict:
    """Create a new user document with 1000 free credits."""
    db = get_db()
    now = datetime.now(timezone.utc)

    user_doc = {
        "firebase_uid": data["firebase_uid"],
        "name": data.get("name", ""),
        "email": data["email"],
        "phone": data.get("phone", ""),
        "occupation": data.get("occupation", ""),
        "gender": data.get("gender", ""),
        "country": data.get("country", ""),
        "auth_provider": data.get("auth_provider", "email"),
        "credits": FREE_CREDITS,
        "total_credits_used": 0,
        "page_setup": DEFAULT_PAGE_SETUP.copy(),
        "created_at": now,
        "updated_at": now,
    }

    result = db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    return user_doc


def get_user_by_uid(firebase_uid: str) -> dict | None:
    """Find user by Firebase UID."""
    db = get_db()
    user = db.users.find_one({"firebase_uid": firebase_uid})
    if user:
        user["_id"] = str(user["_id"])
    return user


def get_user_by_email(email: str) -> dict | None:
    """Find user by email."""
    db = get_db()
    user = db.users.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
    return user


def update_user(firebase_uid: str, updates: dict) -> bool:
    """Update user profile fields."""
    db = get_db()
    updates["updated_at"] = datetime.now(timezone.utc)
    result = db.users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": updates}
    )
    return result.modified_count > 0


def update_page_setup(firebase_uid: str, page_setup: dict) -> bool:
    """Update user's default page setup."""
    db = get_db()
    result = db.users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": {"page_setup": page_setup, "updated_at": datetime.now(timezone.utc)}}
    )
    return result.modified_count > 0


def deduct_credits(firebase_uid: str, credits_to_deduct: int) -> dict | None:
    """
    Atomically deduct credits and increment total_credits_used.
    Returns updated user or None if insufficient credits.
    """
    db = get_db()
    result = db.users.find_one_and_update(
        {"firebase_uid": firebase_uid, "credits": {"$gte": credits_to_deduct}},
        {
            "$inc": {
                "credits": -credits_to_deduct,
                "total_credits_used": credits_to_deduct,
            },
            "$set": {"updated_at": datetime.now(timezone.utc)},
        },
        return_document=True,  # Return the updated document
    )
    if result:
        result["_id"] = str(result["_id"])
    return result


def add_credits(firebase_uid: str, credits_to_add: int) -> bool:
    """Add credits (for purchases)."""
    db = get_db()
    result = db.users.update_one(
        {"firebase_uid": firebase_uid},
        {
            "$inc": {"credits": credits_to_add},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        },
    )
    return result.modified_count > 0
