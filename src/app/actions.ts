"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

export async function login(
  _prevState: { error: string },
  formData: FormData
) {
  const password = (formData.get("password") as string | null)?.trim() ?? "";

  const envPasswords = (process.env.VALID_PASSWORDS ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  let isValid = envPasswords.includes(password);
  let vipName: string | null = null;
  if (!isValid) {
    const { data } = await supabase.from("vip_accounts").select("id, name").eq("password", password).maybeSingle();
    if (data) { isValid = true; vipName = data.name; }
  }

  if (!isValid) {
    return { error: "Incorrect password. Try again." } as { error: string };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip") ?? "unknown";
  const userAgent = headerStore.get("user-agent") ?? "unknown";

  await supabase.from("events").insert({
    type: "login",
    password_used: password,
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
  // Store identity so all subsequent events can be tied to this user
  cookieStore.set("wave-user", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  if (vipName) {
    cookieStore.set("wave-name", vipName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("wave-auth");
  cookieStore.delete("wave-user");
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
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const company = (formData.get("company") as string | null)?.trim() ?? "";
  const title = (formData.get("title") as string | null)?.trim() ?? "";

  if (!name || !email || !company || !title) {
    return { error: "Please fill in all fields.", success: false };
  }

  const { error: dbError } = await supabase.from("rsvps").insert({ name, email, company, title });
  if (dbError) {
    return { error: "Something went wrong. Please try again.", success: false };
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Wave Upfronts <noreply@wave.tv>",
      to: ["jeb.shue@wave.tv"],
      subject: `New RSVP: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="color: #E3F643; background: #0B0909; padding: 24px; margin: 0;">New RSVP — Wave Upfronts 2026</h2>
          <div style="padding: 24px; background: #f9f9f9; border: 1px solid #eee;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Title:</strong> ${title}</p>
          </div>
        </div>
      `,
    });
  }

  return { error: "", success: true };
}

type VipAccountState = {
  error: string;
  success: boolean;
  account?: { id?: string; name: string; email: string; company: string; title: string; password: string; created_at: string };
};

export async function createVipAccount(
  _prevState: VipAccountState,
  formData: FormData
): Promise<VipAccountState> {
  const name     = (formData.get("name")     as string | null)?.trim() ?? "";
  const email    = (formData.get("email")    as string | null)?.trim() ?? "";
  const company  = (formData.get("company")  as string | null)?.trim() ?? "";
  const title    = (formData.get("title")    as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null)?.trim() ?? "";

  if (!name || !email || !company || !title || !password) {
    return { error: "All fields are required.", success: false };
  }

  const { data, error } = await supabase
    .from("vip_accounts")
    .insert({ name, email, company, title, password })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { error: "That password is already in use. Choose another.", success: false };
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
  data: { name: string; email: string; company: string; title: string; password: string }
): Promise<{ error: string; success: boolean }> {
  const { error } = await supabase
    .from("vip_accounts")
    .update(data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "That password is already in use.", success: false };
    return { error: "Failed to update account.", success: false };
  }

  return { error: "", success: true };
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
