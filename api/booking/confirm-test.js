import { supabaseAdmin } from "../../lib/supabase-admin.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getTimeZoneLabel(date, locale = "en-US") {
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZoneName: "short",
    }).formatToParts(date);

    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
}

function formatUtcForViewer(isoString, locale = "en-US") {
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const tzLabel = getTimeZoneLabel(date, locale);
  return tzLabel ? `${formatter.format(date)} (${tzLabel})` : formatter.format(date);
}

function buildEmailContent({ language, clubTitle, clubTimeText, zoomLink, payerName }) {
  const isRu = language === "ru";

  if (isRu) {
    return {
      subject: "Русский литературный клуб — подтверждение записи",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>Запись подтверждена 🎉</h2>
          <p>${payerName ? `Здравствуйте, ${payerName}!` : "Здравствуйте!"}</p>
          <p>Спасибо за оплату. Ваша запись в литературный клуб подтверждена.</p>
          <p><strong>Клуб:</strong> ${clubTitle}</p>
          <p><strong>Время:</strong> ${clubTimeText}</p>
          <p><strong>Ссылка Zoom:</strong><br /><a href="${zoomLink}">${zoomLink}</a></p>
          <p>До встречи на клубе!</p>
        </div>
      `,
    };
  }

  return {
    subject: "Russian Literature Club — booking confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Booking confirmed 🎉</h2>
        <p>${payerName ? `Hello, ${payerName}!` : "Hello!"}</p>
        <p>Thank you for your payment. Your literature club booking has been confirmed.</p>
        <p><strong>Club:</strong> ${clubTitle}</p>
        <p><strong>Time:</strong> ${clubTimeText}</p>
        <p><strong>Your Zoom link:</strong><br /><a href="${zoomLink}">${zoomLink}</a></p>
        <p>See you at the club!</p>
      </div>
    `,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { clubId, email, name, language } = req.body || {};

    if (!clubId || !email) {
      return res.status(400).json({
        error: "Missing clubId or email",
      });
    }

    const lang = language === "ru" ? "ru" : "en";

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

    const fakeOrderId = `test-order-${Date.now()}-${clubId}`;
    const fakeCaptureId = `test-capture-${Date.now()}-${clubId}`;

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        club_id: club.id,
        payer_email: email,
        payer_name: name || null,
        paypal_order_id: fakeOrderId,
        paypal_capture_id: fakeCaptureId,
        payment_status: "captured",
        amount_usd: club.price_usd,
        language: lang,
      })
      .select()
      .single();

    if (bookingError) {
      return res.status(500).json({
        error: "Failed to create booking",
        details: bookingError.message,
      });
    }

    const nextBookedCount = club.booked_count + 1;
    const nextStatus = nextBookedCount >= club.capacity ? "closed" : club.status;

    const { error: updateError } = await supabaseAdmin
      .from("clubs")
      .update({
        booked_count: nextBookedCount,
        status: nextStatus,
      })
      .eq("id", club.id);

    if (updateError) {
      return res.status(500).json({
        error: "Failed to update club booking count",
        details: updateError.message,
      });
    }

    const clubTimeText = formatUtcForViewer(
      club.starts_at_utc,
      lang === "ru" ? "ru-RU" : "en-US"
    );

    const emailContent = buildEmailContent({
      language: lang,
      clubTitle: club.title,
      clubTimeText,
      zoomLink: club.zoom_link,
      payerName: name,
    });

    const emailResult = await resend.emails.send({
      from: "Russian Literature Club <onboarding@resend.dev>",
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return res.status(200).json({
      success: true,
      message:
        lang === "ru"
          ? "Оплата подтверждена 🎉 Ссылка Zoom также отправлена на вашу почту."
          : "Payment successful 🎉 Your Zoom link has also been sent to your email.",
      booking_id: booking.id,
      club_id: club.id,
      zoom_link: club.zoom_link,
      club_title: club.title,
      club_time_text: clubTimeText,
      email_result: emailResult,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message || String(err),
    });
  }
}
