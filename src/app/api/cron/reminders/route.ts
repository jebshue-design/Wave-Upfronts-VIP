import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

// Event date: October 27, 2026
const EVENT_DATE = "2026-10-27";

const REMINDER_SCHEDULE: { type: string; date: string; subject: string; label: string }[] = [
  {
    type: "reminder_30d",
    date: "2026-09-27",
    subject: "One Month Away — Wave Upfronts 2026",
    label: "30-day reminder",
  },
  {
    type: "reminder_14d",
    date: "2026-10-13",
    subject: "Two Weeks Out — Wave Upfronts 2026",
    label: "14-day reminder",
  },
  {
    type: "reminder_7d",
    date: "2026-10-20",
    subject: "One Week Away — Wave Upfronts 2026",
    label: "7-day reminder",
  },
  {
    type: "reminder_2d",
    date: "2026-10-25",
    subject: "Almost Here — Wave Upfronts 2026",
    label: "2-day reminder",
  },
  {
    type: "day_of",
    date: "2026-10-27",
    subject: "Today's the Day — Wave Upfronts 2026",
    label: "Day-of",
  },
];

function getTodayET(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function reminderHtml(name: string, label: string, subject: string): string {
  return `
    <div style="font-family:sans-serif;max-width:520px;background:#0B0909;border-radius:10px;overflow:hidden;">
      <div style="background:#E3F643;height:4px;"></div>
      <div style="padding:32px 32px 24px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#94958B;">Wave Upfronts 2026 · ${label}</p>
        <h2 style="margin:0 0 16px;color:#FAF7F4;font-size:26px;">${subject.split("—")[0].trim()}</h2>
        <p style="margin:0;font-size:15px;color:#94958B;line-height:1.6;">Hi ${name}, just a reminder that Wave Upfronts 2026 is coming up. We can't wait to see you in New York.</p>
      </div>
      <div style="padding:0 32px 32px;">
        <div style="background:#212922;border-radius:8px;padding:20px 24px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr><td style="padding:7px 0;color:#94958B;width:90px;">Event</td><td style="color:#FAF7F4;font-weight:600;">Wave Upfronts 2026</td></tr>
            <tr><td style="padding:7px 0;color:#94958B;">Date</td><td style="color:#E3F643;font-weight:600;">October 27, 2026</td></tr>
            <tr><td style="padding:7px 0;color:#94958B;">Location</td><td style="color:#FAF7F4;">New York, NY</td></tr>
          </table>
        </div>
        <p style="margin:24px 0 0;font-size:12px;color:#3F4640;">Questions? Contact <a href="mailto:jeb.shue@wave.tv" style="color:#E3F643;">jeb.shue@wave.tv</a></p>
      </div>
    </div>
  `;
}

export async function GET(request: NextRequest) {
  // Verify this request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── MASTER KILL SWITCH ──────────────────────────────────────
  // Set REMINDERS_ACTIVE=true in Vercel env vars when ready to send
  if (process.env.REMINDERS_ACTIVE !== "true") {
    return NextResponse.json({
      skipped: true,
      reason: "REMINDERS_ACTIVE is not set to 'true' — no emails sent",
    });
  }

  const today = getTodayET();
  const reminder = REMINDER_SCHEDULE.find((r) => r.date === today);

  if (!reminder) {
    return NextResponse.json({ skipped: true, reason: `No reminder scheduled for ${today}` });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  // Get all RSVPs
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("name, email, company");
  if (!rsvps?.length) {
    return NextResponse.json({ skipped: true, reason: "No RSVPs found" });
  }

  // Check who already received this reminder
  const { data: alreadySent } = await supabase
    .from("email_log")
    .select("recipient_email")
    .eq("type", reminder.type);
  const sentEmails = new Set((alreadySent ?? []).map((r) => r.recipient_email.toLowerCase()));

  const toSend = rsvps.filter((r) => !sentEmails.has(r.email.toLowerCase()));
  if (!toSend.length) {
    return NextResponse.json({ skipped: true, reason: "All RSVPs already received this reminder" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const rsvp of toSend) {
    const firstName = rsvp.name.split(" ")[0];
    try {
      await resend.emails.send({
        from: "Wave Upfronts <upfronts@wave.tv>",
        to: [rsvp.email],
        subject: reminder.subject,
        html: reminderHtml(firstName, reminder.label, reminder.subject),
      });

      await supabase.from("email_log").insert({
        recipient_email: rsvp.email,
        recipient_name: rsvp.name,
        type: reminder.type,
        sent_by: "system",
        notes: `Auto: ${reminder.label}`,
      });

      results.push({ email: rsvp.email, success: true });
    } catch (err) {
      results.push({ email: rsvp.email, success: false, error: String(err) });
    }
  }

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({
    date: today,
    reminderType: reminder.type,
    sent,
    failed,
    results,
  });
}
