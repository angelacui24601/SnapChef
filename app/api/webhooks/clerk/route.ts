import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import pool from "../../../../lib/db/pool";

// Clerk sends these event shapes for the user.* events we care about.
interface ClerkUserData {
  id: string;
  email_addresses: { email_address: string; id: string }[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
}

function primaryEmail(data: ClerkUserData): string | null {
  if (!data.primary_email_address_id) return null;
  const found = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id,
  );
  return found?.email_address ?? null;
}

export async function POST(req: NextRequest) {
  // verifyWebhook reads CLERK_WEBHOOK_SIGNING_SECRET from env automatically
  // and throws if the signature is missing or invalid.
  let evt: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const { type, data } = evt;

  try {
    if (type === "user.created" || type === "user.updated") {
      const user = data as ClerkUserData;
      await pool.query(
        `INSERT INTO users (clerk_id, email, first_name, last_name, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (clerk_id) DO UPDATE SET
           email      = EXCLUDED.email,
           first_name = EXCLUDED.first_name,
           last_name  = EXCLUDED.last_name,
           updated_at = NOW()`,
        [user.id, primaryEmail(user), user.first_name, user.last_name],
      );
    } else if (type === "user.deleted") {
      const { id } = data as { id: string };
      // ON DELETE CASCADE removes user_preferences and favorites automatically.
      await pool.query("DELETE FROM users WHERE clerk_id = $1", [id]);
    }
  } catch (err) {
    console.error(`Failed to handle Clerk event ${type}:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
