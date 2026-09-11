import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendCampaignEmail } from "@/app/actions";

// ── Sequence config ────────────────────────────────────────────────────────
// Adjust daysAfter values here when the sequence is finalized.
// Steps run in order; each fires once unless the contact RSVPs.
const SEQUENCE = [
  { step: 1, daysAfterInvite: 7,  label: "followup 1" },
  { step: 2, daysAfterPrevious: 7, label: "followup 2" },
] as const;

function daysSince(date: string): number {
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
}

export async function GET(req: NextRequest) {
  const secret =
    req.headers.get("x-cron-secret") ??
    req.nextUrl.searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: accounts }, { data: emailLog }, { data: rsvps }] = await Promise.all([
    supabase.from("vip_accounts").select("id, name, email, company, point_of_contact"),
    supabase.from("email_log").select("recipient_email, type, created_at").in("type", ["ae_outreach", "ae_followup"]),
    supabase.from("rsvps").select("email"),
  ]);

  const rsvpEmails = new Set((rsvps ?? []).map((r) => r.email.toLowerCase()));

  const sent: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const account of accounts ?? []) {
    const email = account.email.toLowerCase();
    if (rsvpEmails.has(email)) continue;

    const contactLogs = (emailLog ?? [])
      .filter((l) => l.recipient_email.toLowerCase() === email)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const outreach = contactLogs.findLast?.((l) => l.type === "ae_outreach") ??
      [...contactLogs].reverse().find((l) => l.type === "ae_outreach");

    if (!outreach) {
      skipped.push(`${account.name} (not invited)`);
      continue;
    }

    const followups = contactLogs.filter((l) => l.type === "ae_followup");

    let shouldSend = false;

    if (followups.length === 0 && daysSince(outreach.created_at) >= SEQUENCE[0].daysAfterInvite) {
      shouldSend = true;
    } else if (followups.length === 1 && daysSince(followups[0].created_at) >= SEQUENCE[1].daysAfterPrevious) {
      shouldSend = true;
    } else if (followups.length >= 2) {
      skipped.push(`${account.name} (sequence complete)`);
      continue;
    }

    if (!shouldSend) {
      skipped.push(`${account.name} (waiting)`);
      continue;
    }

    const result = await sendCampaignEmail({
      recipientEmail: account.email,
      recipientName: account.name,
      recipientCompany: account.company ?? "",
      emailType: "ae_followup",
      aeName: account.point_of_contact ?? null,
      sentBy: "system/cron",
      notes: `Auto: ${SEQUENCE[Math.min(followups.length, 1)].label}`,
    });

    if (result.success) {
      sent.push(`${account.name} <${account.email}> (${SEQUENCE[Math.min(followups.length, 1)].label})`);
    } else {
      errors.push(`${account.name}: ${result.error}`);
    }
  }

  return NextResponse.json({
    ok: true,
    sent: sent.length,
    skipped: skipped.length,
    errors: errors.length,
    detail: { sent, skipped, errors },
    runAt: new Date().toISOString(),
  });
}
