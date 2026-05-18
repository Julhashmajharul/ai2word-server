/**
 * Disposable/temporary email domain blocklist.
 * Only trusted email providers are allowed for sign-up.
 */

const ALLOWED_DOMAINS = new Set([
  // Google
  'gmail.com', 'googlemail.com',
  // Microsoft
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'ymail.com', 'rocketmail.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // ProtonMail
  'protonmail.com', 'proton.me', 'pm.me',
  // Zoho
  'zoho.com', 'zohomail.com',
  // AOL
  'aol.com',
  // Tutanota
  'tutanota.com', 'tutamail.com', 'tuta.io',
  // FastMail
  'fastmail.com', 'fastmail.fm',
  // GMX
  'gmx.com', 'gmx.net',
  // Mail.com
  'mail.com', 'email.com',
  // Educational (generic patterns — accept any .edu domain)
  // Handled separately below
]);

/**
 * Check if an email uses a trusted/allowed domain.
 * Returns { valid: boolean, reason?: string }
 */
export function validateEmailDomain(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Invalid email format.' };
  }

  const domain = email.split('@')[1].toLowerCase();

  // Allow educational domains (.edu, .ac.*)
  if (domain.endsWith('.edu') || domain.includes('.ac.')) {
    return { valid: true };
  }

  // Allow corporate/organization domains (.org, .gov)
  if (domain.endsWith('.org') || domain.endsWith('.gov')) {
    return { valid: true };
  }

  if (ALLOWED_DOMAINS.has(domain)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: 'Disposable or temporary email addresses are not allowed. Please use a trusted email provider (Gmail, Outlook, Yahoo, etc.).',
  };
}
