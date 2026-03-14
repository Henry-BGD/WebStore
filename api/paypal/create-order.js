import { supabaseAdmin } from "../../lib/supabase-admin.js";
import { createPayPalOrder } from "../../lib/paypal.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { clubId } = req.body || {};

    if (!clubId) {
      return res.status(400).json({
        error: "Missing clubId",
      });
    }

    const { data: club, error: clubError } = await supabaseAdmin
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .maybeSingle();

    if (clubError) {
      return res.status(500).json({
        error: "Failed to load club",
        details: clubError.message,
      });
    }

    if (!club) {
      return res.status(404).json({
        error: "Club not found",
      });
    }

    if (club.status !== "open") {
      return res.status(400).json({
        error: "Club is not open",
      });
    }

    if (club.booked_count >= club.capacity) {
      return res.status(400).json({
        error: "No spots left",
      });
    }

    const order = await createPayPalOrder({
      amount: club.price_usd,
      description: club.paypal_description,
    });

    return res.status(200).json({
      orderID: order.id,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message || String(err),
    });
  }
}
