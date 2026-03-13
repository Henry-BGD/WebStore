import { supabaseAdmin } from "../../lib/supabase-admin.js";

export default async function handler(req, res) {
  try {
    const { level } = req.query;

    if (!level || !["a2", "b1b2"].includes(level)) {
      return res.status(400).json({
        error: "Invalid or missing level",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("clubs")
      .select("*")
      .eq("level", level)
      .eq("status", "open")
      .order("starts_at_utc", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Database error",
        details: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        error: "No open club found",
      });
    }

    const spotsLeft = Math.max(0, data.capacity - data.booked_count);

    return res.status(200).json({
      id: data.id,
      level: data.level,
      title: data.title,
      starts_at_utc: data.starts_at_utc,
      price_usd: data.price_usd,
      capacity: data.capacity,
      booked_count: data.booked_count,
      spots_left: spotsLeft,
      status: data.status,
      is_payable: data.status === "open" && spotsLeft > 0,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Unexpected server error",
    });
  }
}
