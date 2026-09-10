"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import nodemailer from "nodemailer";

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

  const { data: vipAccount } = await supabase
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
  const name = `${firstName} ${lastName}`.trim();
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const company = (formData.get("company") as string | null)?.trim() ?? "";
  const title = (formData.get("title") as string | null)?.trim() ?? "";

  if (!name || !email || !company || !title) {
    return { error: "Please fill in all fields.", success: false };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address.", success: false };
  }

  // Prevent duplicate RSVPs
  const { data: existing } = await supabase
    .from("rsvps")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (existing) {
    return { error: "", success: true }; // silent success — don't reveal who's on the list
  }

  const { error: dbError } = await supabase.from("rsvps").insert({ name, email: email.toLowerCase(), company, title });
  if (dbError) {
    return { error: "Something went wrong. Please try again.", success: false };
  }

  // Look up assigned AE by matching email to vip_accounts
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
  const { data: vipMatch } = await supabase
    .from("vip_accounts")
    .select("point_of_contact")
    .eq("email", email)
    .maybeSingle();
  const aeName = vipMatch?.point_of_contact ?? null;
  const aeEmail = aeName ? (AE_EMAILS[aeName] ?? "jeb.shue@wave.tv") : "jeb.shue@wave.tv";
  const aeContact = aeName ? `${aeName} (${aeEmail})` : null;

  // Alert to Wave team
  await sendMail({
    to: "jeb.shue@wave.tv",
    subject: `New RSVP: ${name} · ${company}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;background:#0B0909;border-radius:10px;overflow:hidden;">
        <div style="background:#E3F643;height:4px;"></div>
        <div style="padding:28px 32px 20px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#94958B;">Wave Upfronts 2026</p>
          <h2 style="margin:0;color:#FAF7F4;font-size:22px;">New RSVP</h2>
        </div>
        <div style="padding:0 32px 32px;">
          <div style="background:#212922;border-radius:8px;padding:20px 24px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <tr><td style="padding:7px 0;color:#94958B;width:90px;">Name</td><td style="color:#FAF7F4;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:7px 0;color:#94958B;">Email</td><td style="color:#FAF7F4;">${email}</td></tr>
              <tr><td style="padding:7px 0;color:#94958B;">Company</td><td style="color:#E3F643;font-weight:600;">${company}</td></tr>
              <tr><td style="padding:7px 0;color:#94958B;">Title</td><td style="color:#FAF7F4;">${title}</td></tr>
            </table>
          </div>
        </div>
      </div>
    `,
  }).catch(() => {});

  // Confirmation to the attendee
  sendMail({
    to: email,
    subject: "You're confirmed — Wave Upfronts 2026",
    html: `
      <div style="font-family:sans-serif;max-width:520px;background:#0B0909;border-radius:10px;overflow:hidden;">
        <div style="background:#E3F643;height:4px;"></div>
        <div style="padding:32px 32px 24px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#94958B;">Wave Upfronts 2026</p>
          <h2 style="margin:0 0 16px;color:#FAF7F4;font-size:26px;">You're on the list.</h2>
          <p style="margin:0;font-size:15px;color:#94958B;line-height:1.6;">Hi ${name}, we've received your RSVP and you're confirmed for Wave Upfronts 2026. We'll be in touch with event details as we get closer.</p>
        </div>
        <div style="padding:0 32px 32px;">
          <div style="background:#212922;border-radius:8px;padding:20px 24px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <tr><td style="padding:7px 0;color:#94958B;width:90px;">Event</td><td style="color:#FAF7F4;font-weight:600;">Wave Upfronts 2026</td></tr>
              <tr><td style="padding:7px 0;color:#94958B;">Location</td><td style="color:#FAF7F4;">New York, NY</td></tr>
              <tr><td style="padding:7px 0;color:#94958B;">Date</td><td style="color:#E3F643;font-weight:600;">October 27, 2026</td></tr>
            </table>
          </div>
          <p style="margin:24px 0 0;font-size:12px;color:#3F4640;">Questions? Reach out to your Wave contact: <a href="mailto:${aeEmail}" style="color:#E3F643;">${aeContact ?? aeEmail}</a></p>
        </div>
      </div>
    `,
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

  const { data, error } = await supabase
    .from("vip_accounts")
    .insert({ name, email, company, title, password: "" })
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
  const { error } = await supabase.from("vip_accounts").update(data).eq("id", id);
  if (error) return { error: "Failed to save.", success: false };
  return { error: "", success: true };
}

export async function deleteVipAccount(id: string): Promise<{ error: string; success: boolean }> {
  const { error } = await supabase.from("vip_accounts").delete().eq("id", id);
  if (error) return { error: "Failed to delete account.", success: false };
  return { error: "", success: true };
}

export async function updateVipAccount(
  id: string,
  data: { name: string; email: string; company: string; title: string }
): Promise<{ error: string; success: boolean }> {
  const { error } = await supabase
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

export async function bulkCreateVipAccounts(
  accounts: { name: string; email: string; company: string; title: string; point_of_contact: string }[]
): Promise<{ results: { name: string; email: string; company: string; title: string; point_of_contact: string; success: boolean; error?: string }[] }> {
  const results = await Promise.all(
    accounts.map(async (acc) => {
      const { error } = await supabase
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
