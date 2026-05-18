"""
MongoDB connection setup with PyMongo.
Creates indexes on startup for optimal query performance and TTL auto-deletion.
"""
import os
import certifi
from pymongo import MongoClient

_client = None
_db = None


def get_db():
    """Get the MongoDB database instance (lazy-initialized singleton)."""
    global _client, _db
    if _db is None:
        uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/ai2word")
        db_name = os.environ.get("MONGODB_DB_NAME", "ai2word")
        # Use certifi CA bundle to avoid Python 3.14 TLS handshake issues with Atlas
        _client = MongoClient(
            uri,
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000,
        )
        _db = _client[db_name]
        _ensure_indexes(_db)
        print(f"[DB] Connected to MongoDB: {db_name}")
    return _db


def _ensure_indexes(db):
    """Create indexes on first connection."""
    try:
        # users: unique indexes on firebase_uid and email
        db.users.create_index("firebase_uid", unique=True)
        db.users.create_index("email", unique=True)

        # conversion_history: TTL index — auto-delete documents 3 days (259200 seconds) after created_at
        db.conversion_history.create_index("created_at", expireAfterSeconds=259200)
        db.conversion_history.create_index("user_id")

        # subscriptions: index for quick lookup by user
        db.subscriptions.create_index("user_id")
        db.subscriptions.create_index([("user_id", 1), ("status", 1)])
        print("[DB] Indexes ensured.")
    except Exception as e:
        print(f"[DB] Index creation warning: {e}")
