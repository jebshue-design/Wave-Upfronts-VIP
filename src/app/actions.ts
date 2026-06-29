"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export async function login(
  _prevState: { error: string },
  formData: FormData
) {
  const password = (formData.get("password") as string | null)?.trim() ?? "";

  const validPasswords = (process.env.VALID_PASSWORDS ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (!validPasswords.includes(password)) {
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

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("wave-auth");
  redirect("/login");
}

export async function trackEvent(type: string, metadata?: Record<string, string>) {
  await supabase.from("events").insert({ type, metadata });
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
