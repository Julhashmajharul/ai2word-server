"""
Server-side disposable email validation.
Mirrors the client-side logic but acts as the authoritative check.
"""

ALLOWED_DOMAINS = {
    # Google
    "gmail.com", "googlemail.com",
    # Microsoft
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    # Yahoo
    "yahoo.com", "yahoo.co.uk", "yahoo.co.in", "ymail.com", "rocketmail.com",
    # Apple
    "icloud.com", "me.com", "mac.com",
    # ProtonMail
    "protonmail.com", "proton.me", "pm.me",
    # Zoho
    "zoho.com", "zohomail.com",
    # AOL
    "aol.com",
    # Tutanota
    "tutanota.com", "tutamail.com", "tuta.io",
    # FastMail
    "fastmail.com", "fastmail.fm",
    # GMX
    "gmx.com", "gmx.net",
    # Mail.com
    "mail.com", "email.com",
}


def validate_email_domain(email: str) -> tuple[bool, str]:
    """
    Check if an email uses a trusted domain.
    Returns (is_valid: bool, reason: str).
    """
    if not email or "@" not in email:
        return False, "Invalid email address."

    domain = email.split("@")[1].lower().strip()

    # Allow educational domains
    if domain.endswith(".edu") or ".ac." in domain:
        return True, ""

    # Allow .org and .gov
    if domain.endswith(".org") or domain.endswith(".gov"):
        return True, ""

    if domain in ALLOWED_DOMAINS:
        return True, ""

    return False, (
        "Disposable or temporary email addresses are not allowed. "
        "Please use a trusted email provider (Gmail, Outlook, Yahoo, etc.)."
    )
