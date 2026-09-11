"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import nodemailer from "nodemailer";

// ── AE roster ──────────────────────────────────────────────────────────────
const AE_EMAILS: Record<string, string> = {
  "Tom Defina":        "tom.defina@wave.tv",
  "Gabby Davino":      "gabby.davino@wave.tv",
  "Larry Menkes":      "larry.menkes@wave.tv",
  "Ethan Abrams":      "ethan.abrams@wave.tv",
  "Liane Sousa":       "liane.sousa@wave.tv",
  "Megan Rall":        "megan.rall@wave.tv",
  "Austie Montgomery": "austie.montgomery@wave.tv",
  "Dean Markus":       "dean.markus@wave.tv",
  "Meg Jones":         "meg.jones@wave.tv",
};

const SITE_URL = process.env.SITE_URL ?? "https://wave-upfronts-vip.vercel.app";

// ── Per-type email templates ────────────────────────────────────────────────
// Each function returns a full HTML string. Edit each independently as designs evolve.

function emailShell(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style>
  a { color: #E3F643; }
  a:hover { color: #EDFF6B; }
  @media only screen and (max-width:620px){
    .shell{width:100%!important}
    .outer{padding:0!important}
    .pad{padding-left:24px!important;padding-right:24px!important}
    .stack{display:block!important;width:100%!important;box-sizing:border-box!important}
    .stack-gap{padding-top:20px!important;border-top:1px solid #2B2B28!important}
    .h1{font-size:34px!important;line-height:36px!important}
    .cta a{display:block!important;text-align:center!important}
    .cta-wrap{width:100%!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#17171A;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
${preheader ? `<span style="display:none;font-size:1px;color:#17171A;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>` : ""}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#17171A;">
  <tr>
    <td align="center" class="outer" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="shell" style="width:600px;max-width:600px;background-color:#0B0909;border-radius:16px;">
        <tr><td height="6" style="height:6px;line-height:6px;font-size:0;background-color:#E3F643;border-radius:16px 16px 0 0;">&nbsp;</td></tr>
        <tr>
          <td class="pad" align="left" style="padding:32px 40px 28px;border-bottom:1px solid #2B2B28;">
            <img src="https://wave-upfronts-vip.vercel.app/assets/wave-primary-lockup-white.svg" width="196" height="34" alt="Wave Sports &amp; Entertainment" style="display:block;width:196px;height:auto;border:0;outline:none;text-decoration:none;">
          </td>
        </tr>
        ${content}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function detailsCard(): string {
  return `
<tr>
  <td class="pad" style="padding:32px 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#212922;border-radius:16px;">
      <tr>
        <td style="padding:28px 28px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td class="stack" width="52%" valign="top" style="width:52%;padding:0 12px 0 0;">
                <p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;letter-spacing:1.4px;text-transform:uppercase;color:#B9BAB1;font-weight:bold;">Date</p>
                <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:24px;line-height:28px;mso-line-height-rule:exactly;letter-spacing:-0.5px;color:#E3F643;font-weight:bold;">Tuesday,<br>October 27, 2026</p>
              </td>
              <td class="stack stack-gap" width="48%" valign="top" style="width:48%;padding:0;">
                <p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;letter-spacing:1.4px;text-transform:uppercase;color:#B9BAB1;font-weight:bold;">Time</p>
                <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:24px;line-height:28px;mso-line-height-rule:exactly;letter-spacing:-0.5px;color:#FAF7F4;font-weight:bold;">5:30 &ndash; 9:00 PM ET</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="padding:24px 28px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:#3A413A;">&nbsp;</td></tr></table></td></tr>
      <tr>
        <td style="padding:24px 28px 28px;">
          <p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;letter-spacing:1.4px;text-transform:uppercase;color:#B9BAB1;font-weight:bold;">Location</p>
          <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:24px;mso-line-height-rule:exactly;color:#FAF7F4;font-weight:bold;">The Altman Building</p>
          <p style="margin:0 0 2px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;mso-line-height-rule:exactly;color:#E4E1DE;">135 West 18th Street</p>
          <p style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;mso-line-height-rule:exactly;color:#B9BAB1;">New York, NY 10011</p>
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;letter-spacing:1.2px;text-transform:uppercase;font-weight:bold;">
            <a href="https://maps.google.com/?q=135+West+18th+Street+New+York+NY+10011" style="color:#E3F643;text-decoration:none;">Get directions &rarr;</a>
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function contactFooter(aeName: string, aeEmailAddr: string): string {
  return `
<tr>
  <td class="pad" style="padding:40px 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:#2B2B28;">&nbsp;</td></tr>
    </table>
  </td>
</tr>
<tr>
  <td class="pad" style="padding:24px 40px 0;">
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;color:#E4E1DE;">
      Questions? Reach ${aeName} at <a href="mailto:${aeEmailAddr}" style="color:#E3F643;text-decoration:underline;">${aeEmailAddr}</a>.
    </p>
  </td>
</tr>
<tr>
  <td class="pad" style="padding:36px 40px 44px;border-radius:0 0 16px 16px;">
    <p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#94958B;">Wave Sports &amp; Entertainment</p>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#94958B;">
      You're receiving this because you were invited to Wave Upfronts.
      <a href="${SITE_URL}/unsubscribe" style="color:#94958B;text-decoration:underline;">Unsubscribe</a>
    </p>
  </td>
</tr>`;
}

// Full footer used on the RSVP confirmation (includes address + unsubscribe)
function confirmationContactFooter(aeName: string, aeEmailAddr: string): string {
  return `
<tr>
  <td class="pad" style="padding:40px 40px 0 40px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:#2B2B28;">&nbsp;</td></tr></table>
  </td>
</tr>
<tr>
  <td class="pad" style="padding:24px 40px 0 40px;">
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;mso-line-height-rule:exactly;color:#E4E1DE;">Questions before the doors open? Reach ${aeName} at <a href="mailto:${aeEmailAddr}" style="color:#E3F643;text-decoration:underline;">${aeEmailAddr}</a>.</p>
  </td>
</tr>
<tr>
  <td class="pad" style="padding:36px 40px 44px 40px;border-radius:0 0 16px 16px;">
    <p style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:16px;mso-line-height-rule:exactly;letter-spacing:1.2px;text-transform:uppercase;color:#94958B;">Wave Sports &amp; Entertainment</p>
    <p style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#94958B;">135 West 18th Street, 5th Floor, New York, NY 10011</p>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#94958B;">You're receiving this because you registered for Wave Upfronts. <a href="https://wavesports.tv/unsubscribe" style="color:#94958B;text-decoration:underline;">Unsubscribe</a> &middot; <a href="https://wavesports.tv/preferences" style="color:#94958B;text-decoration:underline;">Email preferences</a></p>
  </td>
</tr>`;
}

// Invitation — first outreach asking them to RSVP
function buildInvitationEmail(name: string, company: string, aeName: string, aeEmailAddr: string): string {
  return emailShell(`
<tr>
  <td class="pad" align="left" style="padding:40px 40px 0;">
    <p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:#E3F643;font-weight:bold;">You're Invited</p>
    <h1 class="h1" style="margin:0 0 18px;font-family:Helvetica,Arial,sans-serif;font-size:42px;line-height:44px;letter-spacing:-1px;color:#FAF7F4;font-weight:bold;">Wave Upfronts 2027</h1>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#E4E1DE;">
      Hi <strong style="color:#FAF7F4;">${name}</strong> — on behalf of the Wave Sports &amp; Entertainment team, we'd love to have you join us for an evening of sports, content, and conversation in New York.
    </p>
  </td>
</tr>
${detailsCard()}
<tr>
  <td class="pad" style="padding:32px 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="cta-wrap" style="width:auto;">
      <tr>
        <td align="center" bgcolor="#E3F643" style="border-radius:999px;">
          <a href="${SITE_URL}" style="display:inline-block;padding:16px 34px;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;font-weight:bold;color:#0B0909;text-decoration:none;border-radius:999px;">Reserve Your Spot &rarr;</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
${contactFooter(aeName, aeEmailAddr)}`);
}

// Follow-up — sent when no RSVP after N days
function buildFollowupEmail(name: string, company: string, aeName: string, aeEmailAddr: string): string {
  return emailShell(`
<tr>
  <td class="pad" align="left" style="padding:40px 40px 0;">
    <p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:#E3F643;font-weight:bold;">Don't Miss Out</p>
    <h1 class="h1" style="margin:0 0 18px;font-family:Helvetica,Arial,sans-serif;font-size:42px;line-height:44px;letter-spacing:-1px;color:#FAF7F4;font-weight:bold;">Wave Upfronts 2027</h1>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#E4E1DE;">
      Hi <strong style="color:#FAF7F4;">${name}</strong> — just following up on our invitation. Spots are filling up and we want to make sure you have a seat. Reserve yours before we close the list.
    </p>
  </td>
</tr>
${detailsCard()}
<tr>
  <td class="pad" style="padding:32px 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="cta-wrap" style="width:auto;">
      <tr>
        <td align="center" bgcolor="#E3F643" style="border-radius:999px;">
          <a href="${SITE_URL}" style="display:inline-block;padding:16px 34px;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;font-weight:bold;color:#0B0909;text-decoration:none;border-radius:999px;">Reserve Your Spot &rarr;</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
${contactFooter(aeName, aeEmailAddr)}`);
}

// RSVP Confirmation — sent automatically after someone RSVPs
function buildConfirmationEmail(name: string, aeName: string, aeEmailAddr: string): string {
  return emailShell(`
<tr>
  <td class="pad" align="left" style="padding:40px 40px 0 40px;">
    <p style="margin:0 0 14px 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;letter-spacing:1.4px;text-transform:uppercase;color:#E3F643;font-weight:bold;">You're confirmed</p>
    <h1 class="h1" style="margin:0 0 18px 0;font-family:Helvetica,Arial,sans-serif;font-size:42px;line-height:44px;mso-line-height-rule:exactly;letter-spacing:-1px;color:#FAF7F4;font-weight:bold;">Wave Upfronts 2027</h1>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;mso-line-height-rule:exactly;color:#E4E1DE;">Hi <strong style="color:#FAF7F4;">${name}</strong> — we've got you on the list. Full event details, lineup and arrival instructions land in your inbox closer to the date.</p>
  </td>
</tr>
${detailsCard()}
<tr>
  <td class="pad" style="padding:32px 40px 0 40px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="cta-wrap" style="width:auto;">
      <tr>
        <td class="cta" align="center" bgcolor="#E3F643" style="border-radius:999px;">
          <a href="https://wavesports.tv/upfronts" style="display:inline-block;padding:16px 34px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;letter-spacing:1.6px;text-transform:uppercase;font-weight:bold;color:#0B0909;text-decoration:none;border-radius:999px;">Explore the lineup &rarr;</a>
        </td>
      </tr>
    </table>
    <p style="margin:18px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;letter-spacing:1.2px;text-transform:uppercase;font-weight:bold;"><a href="https://wavesports.tv/upfronts/calendar.ics" style="color:#B9BAB1;text-decoration:none;">Add to calendar &rarr;</a></p>
  </td>
</tr>
${confirmationContactFooter(aeName, aeEmailAddr)}`,
    `You're on the list for Wave Upfronts 2027 — Tuesday, October 27, 2026, 5:30 – 9:00 PM ET, The Altman Building, New York.`
  );
}

// Reminder — generic template used for 30d / 14d / 7d / 2d / day-of
function buildReminderEmail(name: string, daysOut: number | "day-of", aeName: string, aeEmailAddr: string): string {
  const eyebrow = daysOut === "day-of" ? "See You Tonight" : `${daysOut} Days Away`;
  const body = daysOut === "day-of"
    ? `Hi <strong style="color:#FAF7F4;">${name}</strong> — tonight's the night. Doors open at 5:30 PM. We'll see you at 135 West 18th Street.`
    : `Hi <strong style="color:#FAF7F4;">${name}</strong> — a quick heads-up that Wave Upfronts 2027 is ${daysOut} days away. We're looking forward to seeing you.`;

  return emailShell(`
<tr>
  <td class="pad" align="left" style="padding:40px 40px 0;">
    <p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:#E3F643;font-weight:bold;">${eyebrow}</p>
    <h1 class="h1" style="margin:0 0 18px;font-family:Helvetica,Arial,sans-serif;font-size:42px;line-height:44px;letter-spacing:-1px;color:#FAF7F4;font-weight:bold;">Wave Upfronts 2027</h1>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#E4E1DE;">${body}</p>
  </td>
</tr>
${detailsCard()}
${contactFooter(aeName, aeEmailAddr)}`);
}

function getMailer() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function sendMail(opts: { to: string | string[]; subject: string; html: string }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return Promise.resolve();
  return getMailer().sendMail({
    from: `Wave Upfronts <${process.env.GMAIL_USER}>`,
    to: Array.isArray(opts.to) ? opts.to.join(", ") : opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

export async function login(
  _prevState: { error: string },
  formData: FormData
) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";

  if (!email) {
    return { error: "Please enter your email address." } as { error: string };
  }

  const { data: vipAccount } = await supabaseAdmin
    .from("vip_accounts")
    .select("id, name, email, password")
    .eq("email", email)
    .maybeSingle();

  if (!vipAccount) {
    return { error: "We don't recognize that email. Contact your Wave representative." } as { error: string };
  }

  const vipName = vipAccount.name;
  const identifier = vipAccount.email;

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip") ?? "unknown";
  const userAgent = headerStore.get("user-agent") ?? "unknown";

  await supabase.from("events").insert({
    type: "login",
    password_used: identifier,
    ip,
    user_agent: userAgent,
  });

  const cookieStore = await cookies();
  cookieStore.set("wave-auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  cookieStore.set("wave-user", identifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  cookieStore.set("wave-name", vipName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Alert team when a VIP logs in (fire-and-forget)
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });
  sendMail({
    to: "jeb.shue@wave.tv",
    subject: `VIP Login: ${vipName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;background:#0B0909;border-radius:10px;overflow:hidden;">
        <div style="background:#E3F643;height:4px;"></div>
        <div style="padding:28px 32px 20px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#94958B;">Wave Upfronts 2026</p>
          <h2 style="margin:0;color:#FAF7F4;font-size:22px;">VIP Login Alert</h2>
        </div>
        <div style="padding:0 32px 32px;">
          <div style="background:#212922;border-radius:8px;padding:20px 24px;">
            <p style="margin:0 0 16px;font-size:15px;color:#FAF7F4;"><strong style="color:#E3F643;">${vipName}</strong> just accessed the VIP portal.</p>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <tr><td style="padding:6px 0;color:#94958B;width:110px;">Time</td><td style="color:#FAF7F4;">${now} ET</td></tr>
              <tr><td style="padding:6px 0;color:#94958B;">Email</td><td style="color:#FAF7F4;">${email}</td></tr>
              <tr><td style="padding:6px 0;color:#94958B;">IP Address</td><td style="color:#FAF7F4;">${ip}</td></tr>
            </table>
          </div>
        </div>
      </div>
    `,
  }).catch(() => {});

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("wave-auth");
  cookieStore.delete("wave-user");
  cookieStore.delete("wave-name");
  redirect("/login");
}

export async function trackEvent(type: string, metadata?: Record<string, string>) {
  const cookieStore = await cookies();
  const user = cookieStore.get("wave-user")?.value ?? "unknown";
  await supabase.from("events").insert({ type, password_used: user, metadata });
}

export async function submitRsvp(
  _prevState: { error: string; success: boolean },
  formData: FormData
): Promise<{ error: string; success: boolean }> {
  const firstName = (formData.get("firstName") as string | null)?.trim() ?? "";
  const lastName = (formData.get("lastName") as string | null)?.trim() ?? "";
  const name = [firstName, lastName].filter(Boolean).join(" ");
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const company = (formData.get("company") as string | null)?.trim() ?? "";
  const title = (formData.get("title") as string | null)?.trim() ?? "";

  if (!firstName || !lastName || !email || !company || !title) {
    return { error: "Please fill in all fields.", success: false };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address.", success: false };
  }

  // Prevent duplicate RSVPs — but still send confirmation so they have the details
  const { data: existing } = await supabaseAdmin
    .from("rsvps")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (existing) {
    // Re-send confirmation quietly, then return success
    const { data: vipMatch2 } = await supabaseAdmin.from("vip_accounts").select("point_of_contact").eq("email", email).maybeSingle();
    const aeName2 = vipMatch2?.point_of_contact ?? null;
    const aeEmailAddr2 = aeName2 ? (AE_EMAILS[aeName2] ?? "jeb.shue@wave.tv") : "jeb.shue@wave.tv";
    await sendCampaignEmail({ recipientEmail: email, recipientName: name, recipientCompany: company, emailType: "rsvp_confirmation", aeName: aeName2, sentBy: "system" }).catch(() => {});
    return { error: "", success: true };
  }

  const { error: dbError } = await supabaseAdmin.from("rsvps").insert({ name, email: email.toLowerCase(), company, title });
  if (dbError) {
    return { error: "Something went wrong. Please try again.", success: false };
  }

  // Look up assigned AE
  const { data: vipMatch } = await supabaseAdmin
    .from("vip_accounts")
    .select("point_of_contact")
    .eq("email", email)
    .maybeSingle();
  const aeName = vipMatch?.point_of_contact ?? null;
  const aeEmailAddr = aeName ? (AE_EMAILS[aeName] ?? "jeb.shue@wave.tv") : "jeb.shue@wave.tv";

  // Alert Wave team
  await sendMail({
    to: "jeb.shue@wave.tv",
    subject: `New RSVP: ${name} · ${company}`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#17171A;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#17171A;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" style="background:#0B0909;border-radius:12px;">
      <tr><td height="4" style="height:4px;background:#E3F643;border-radius:12px 12px 0 0;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 32px 20px;">
        <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#94958B;">Wave Upfronts 2027</p>
        <h2 style="margin:0;font-family:Helvetica,Arial,sans-serif;color:#FAF7F4;font-size:22px;">New RSVP</h2>
      </td></tr>
      <tr><td style="padding:0 32px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#212922;border-radius:10px;">
          <tr><td style="padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;">
              <tr><td style="padding:7px 0;color:#94958B;width:90px;">Name</td><td style="color:#FAF7F4;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:7px 0;color:#94958B;">Email</td><td style="color:#FAF7F4;">${email}</td></tr>
              <tr><td style="padding:7px 0;color:#94958B;">Company</td><td style="color:#E3F643;font-weight:600;">${company}</td></tr>
              <tr><td style="padding:7px 0;color:#94958B;">Title</td><td style="color:#FAF7F4;">${title}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`,
  }).catch(() => {});

  // Confirmation to the attendee using new template
  await sendCampaignEmail({
    recipientEmail: email,
    recipientName: name,
    recipientCompany: company,
    emailType: "rsvp_confirmation",
    aeName,
    sentBy: "system",
  }).catch(() => {});

  return { error: "", success: true };
}

type VipAccountState = {
  error: string;
  success: boolean;
  account?: { id?: string; name: string; email: string; company: string; title: string; created_at: string };
};

export async function createVipAccount(
  _prevState: VipAccountState,
  formData: FormData
): Promise<VipAccountState> {
  const name    = (formData.get("name")    as string | null)?.trim() ?? "";
  const email   = (formData.get("email")   as string | null)?.trim() ?? "";
  const company = (formData.get("company") as string | null)?.trim() ?? "";
  const title   = (formData.get("title")   as string | null)?.trim() ?? "";

  if (!name || !email || !company || !title) {
    return { error: "All fields are required.", success: false };
  }

  const { data, error } = await supabaseAdmin
    .from("vip_accounts")
    .insert({ name, email, company, title, password: name.replace(/\s+/g, "") + "-WaveUpfronts" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { error: "An account with that email already exists.", success: false };
    return { error: "Failed to create account. Try again.", success: false };
  }

  return { error: "", success: true, account: data };
}

export async function updateVipInfo(
  id: string,
  data: { point_of_contact: string; past_deals: string; notes: string; client_status: string }
): Promise<{ error: string; success: boolean }> {
  const { error } = await supabaseAdmin.from("vip_accounts").update(data).eq("id", id);
  if (error) return { error: "Failed to save.", success: false };
  return { error: "", success: true };
}

export async function deleteVipAccount(id: string): Promise<{ error: string; success: boolean }> {
  const { error } = await supabaseAdmin.from("vip_accounts").delete().eq("id", id);
  if (error) return { error: "Failed to delete account.", success: false };
  return { error: "", success: true };
}

export async function updateVipAccount(
  id: string,
  data: { name: string; email: string; company: string; title: string }
): Promise<{ error: string; success: boolean }> {
  const { error } = await supabaseAdmin
    .from("vip_accounts")
    .update(data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "An account with that email already exists.", success: false };
    return { error: "Failed to update account.", success: false };
  }

  return { error: "", success: true };
}

export async function logEmail(data: {
  recipient_email: string;
  recipient_name: string;
  type: string;
  sent_by: string;
  notes?: string;
}): Promise<{ error: string; success: boolean }> {
  const { error } = await supabase.from("email_log").insert(data);
  if (error) return { error: error.message, success: false };
  return { error: "", success: true };
}

import type { CampaignEmailType } from "@/lib/types";

export async function sendCampaignEmail(data: {
  recipientEmail: string;
  recipientName: string;
  recipientCompany: string;
  emailType: CampaignEmailType;
  aeName?: string | null;
  sentBy?: string;
  notes?: string;
}): Promise<{ error: string; success: boolean }> {
  const { recipientEmail, recipientName, recipientCompany, emailType, aeName, sentBy = "admin", notes } = data;

  const aeEmailAddr = aeName ? (AE_EMAILS[aeName] ?? "jeb.shue@wave.tv") : "jeb.shue@wave.tv";
  const aeDisplayName = aeName ?? "the Wave team";

  const subjectMap: Record<CampaignEmailType, string> = {
    ae_outreach:        "You're Invited — Wave Upfronts 2027",
    ae_followup:        "Following up — Wave Upfronts 2027",
    ae_onesheet:        "Wave Upfronts 2027 — One Sheet",
    rsvp_confirmation:  "You're Confirmed — Wave Upfronts 2027",
    reminder_30d:       "30 Days Until Wave Upfronts 2027",
    reminder_14d:       "2 Weeks Until Wave Upfronts 2027",
    reminder_7d:        "One Week Until Wave Upfronts 2027",
    reminder_2d:        "2 Days Until Wave Upfronts 2027",
    day_of:             "Tonight — Wave Upfronts 2027",
  };

  const htmlMap: Record<CampaignEmailType, string> = {
    ae_outreach:        buildInvitationEmail(recipientName, recipientCompany, aeDisplayName, aeEmailAddr),
    ae_followup:        buildFollowupEmail(recipientName, recipientCompany, aeDisplayName, aeEmailAddr),
    ae_onesheet:        buildFollowupEmail(recipientName, recipientCompany, aeDisplayName, aeEmailAddr), // placeholder — design separately
    rsvp_confirmation:  buildConfirmationEmail(recipientName, aeDisplayName, aeEmailAddr),
    reminder_30d:       buildReminderEmail(recipientName, 30, aeDisplayName, aeEmailAddr),
    reminder_14d:       buildReminderEmail(recipientName, 14, aeDisplayName, aeEmailAddr),
    reminder_7d:        buildReminderEmail(recipientName, 7, aeDisplayName, aeEmailAddr),
    reminder_2d:        buildReminderEmail(recipientName, 2, aeDisplayName, aeEmailAddr),
    day_of:             buildReminderEmail(recipientName, "day-of", aeDisplayName, aeEmailAddr),
  };

  try {
    await sendMail({ to: recipientEmail, subject: subjectMap[emailType], html: htmlMap[emailType] });
    await supabase.from("email_log").insert({
      recipient_email: recipientEmail.toLowerCase(),
      recipient_name: recipientName,
      type: emailType,
      sent_by: sentBy,
      notes: notes ?? null,
    });
    return { error: "", success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Send failed.", success: false };
  }
}

export async function bulkCreateVipAccounts(
  accounts: { name: string; email: string; company: string; title: string; point_of_contact: string }[]
): Promise<{ results: { name: string; email: string; company: string; title: string; point_of_contact: string; success: boolean; error?: string }[] }> {
  const results = await Promise.all(
    accounts.map(async (acc) => {
      const { error } = await supabaseAdmin
        .from("vip_accounts")
        .insert({ name: acc.name, email: acc.email, company: acc.company, title: acc.title, point_of_contact: acc.point_of_contact || null, password: "" });
      if (error) {
        return {
          name: acc.name, email: acc.email, company: acc.company, title: acc.title,
          point_of_contact: acc.point_of_contact, success: false,
          error: error.code === "23505" ? "Email already exists" : error.message,
        };
      }
      return { name: acc.name, email: acc.email, company: acc.company, title: acc.title, point_of_contact: acc.point_of_contact, success: true };
    })
  );
  return { results };
}

export async function adminLogin(
  _prevState: { error: string },
  formData: FormData
) {
  const password = (formData.get("password") as string | null)?.trim() ?? "";

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Incorrect password." } as { error: string };
  }

  const cookieStore = await cookies();
  cookieStore.set("wave-admin", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/admin");
}
