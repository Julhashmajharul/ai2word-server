"""
Conversion history model — MongoDB document operations.
Documents auto-delete after 3 days via TTL index (configured in database.py).
"""
import math
from datetime import datetime, timezone
from bson import ObjectId
from config.database import get_db


def create_history_entry(user_id: str, markdown_text: str, word_count: int, credits_used: int) -> dict:
    """Create a new conversion history entry."""
    db = get_db()

    # Auto-extract title from first heading or first 50 characters
    title = _extract_title(markdown_text)

    doc = {
        "user_id": user_id,
        "title": title,
        "markdown_text": markdown_text[:5000],  # Store first 5000 chars only
        "word_count": word_count,
        "credits_used": credits_used,
        "created_at": datetime.now(timezone.utc),
    }

    result = db.conversion_history.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


def get_user_history(user_id: str, limit: int = 50) -> list:
    """Get all conversion history for a user, most recent first."""
    db = get_db()
    cursor = db.conversion_history.find(
        {"user_id": user_id},
        {"markdown_text": 0}  # Exclude full text for list view
    ).sort("created_at", -1).limit(limit)

    history = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        history.append(doc)
    return history


def delete_history_entry(user_id: str, entry_id: str) -> bool:
    """Delete a specific history entry (only if it belongs to the user)."""
    db = get_db()
    try:
        result = db.conversion_history.delete_one({
            "_id": ObjectId(entry_id),
            "user_id": user_id,
        })
        return result.deleted_count > 0
    except Exception:
        return False


def calculate_credits(word_count: int) -> int:
    """Calculate credits needed for a given word count. 1 credit = 1500 words."""
    if word_count <= 0:
        return 0
    return max(1, math.ceil(word_count / 1500))


def _extract_title(markdown_text: str) -> str:
    """Extract title from first heading or first 50 characters."""
    import re
    for line in markdown_text.split("\n"):
        stripped = line.strip()
        if stripped.startswith("#"):
            title = re.sub(r"^#+\s*", "", stripped).strip()
            if title:
                return title[:100]
    # Fallback: first 50 non-empty characters
    clean = markdown_text.strip()[:50].replace("\n", " ").strip()
    return clean if clean else "Untitled Document"
