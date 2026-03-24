/**
 * requireSession — reads the signed HTTP-only session cookie set during
 * /api/users/sync and attaches the Postgres user UUID to req.userId.
 *
 * Returns 401 if the cookie is absent or the signature is invalid (i.e. tampered).
 */
function requireSession(req, res, next) {
  const userId = req.signedCookies?.sc_session;

  if (!userId || typeof userId !== "string") {
    return res.status(401).json({ error: "Not authenticated" });
  }

  req.userId = userId;
  next();
}

module.exports = { requireSession };
