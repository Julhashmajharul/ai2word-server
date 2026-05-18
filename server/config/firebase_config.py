"""
Firebase Admin SDK initialization for token verification.
"""
import os
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

_app = None


def init_firebase():
    """Initialize Firebase Admin SDK (called once at app startup)."""
    global _app
    if _app is not None:
        return

    service_account_path = os.environ.get(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        "./firebase-service-account.json"
    )

    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
    else:
        # Fallback: try to use application default credentials (for Cloud Run / GCE)
        cred = credentials.ApplicationDefault()

    _app = firebase_admin.initialize_app(cred)


def verify_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.
    Raises firebase_admin.auth.InvalidIdTokenError on failure.
    """
    return firebase_auth.verify_id_token(id_token)
