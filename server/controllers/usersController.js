const pool = require("../db/pool");

/** Cookie options — shared by set and clear. */
const SESSION_COOKIE_NAME = "sc_session";
const cookieOptions = {
  httpOnly: true,   // JS cannot read it
  signed: true,     // HMAC-signed with COOKIE_SECRET
  sameSite: "lax",  // safe for same-site + proxied requests
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function setSessionCookie(res, postgresUserId) {
  res.cookie(SESSION_COOKIE_NAME, postgresUserId, cookieOptions);
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
}

async function syncUser(req, res) {
  const { clerkUserId, email } = req.body;

  if (!clerkUserId || typeof clerkUserId !== "string") {
    return res.status(400).json({ error: "clerkUserId is required" });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email is required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingByClerkId = await client.query(
      `
        SELECT id, clerk_id, email, created_at
        FROM users
        WHERE clerk_id = $1
      `,
      [clerkUserId],
    );

    if (existingByClerkId.rows.length > 0) {
      const updated = await client.query(
        `
          UPDATE users
          SET email = $2
          WHERE clerk_id = $1
          RETURNING id, clerk_id, email, created_at
        `,
        [clerkUserId, normalizedEmail],
      );

      await client.query("COMMIT");
      setSessionCookie(res, updated.rows[0].id);
      return res.status(200).json({ user: updated.rows[0] });
    }

    const existingByEmail = await client.query(
      `
        SELECT id, clerk_id, email, created_at
        FROM users
        WHERE email = $1
      `,
      [normalizedEmail],
    );

    if (existingByEmail.rows.length > 0) {
      const updated = await client.query(
        `
          UPDATE users
          SET clerk_id = $2
          WHERE email = $1
          RETURNING id, clerk_id, email, created_at
        `,
        [normalizedEmail, clerkUserId],
      );

      await client.query("COMMIT");
      setSessionCookie(res, updated.rows[0].id);
      return res.status(200).json({ user: updated.rows[0] });
    }

    const created = await client.query(
      `
        INSERT INTO users (clerk_id, email)
        VALUES ($1, $2)
        RETURNING id, clerk_id, email, created_at
      `,
      [clerkUserId, normalizedEmail],
    );

    await client.query("COMMIT");
    setSessionCookie(res, created.rows[0].id);
    return res.status(200).json({ user: created.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to sync user", error);
    return res.status(500).json({ error: "Failed to sync user" });
  } finally {
    client.release();
  }
}

function logoutUser(req, res) {
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}

module.exports = {
  syncUser,
  logoutUser,
};
