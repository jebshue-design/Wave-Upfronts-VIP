"use client";

import { useActionState } from "react";
import { adminLogin } from "@/app/actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, { error: "" });

  return (
    <div style={{
      minHeight: "100vh", background: "#0B0909",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "40px" }}>
        <div style={{
          fontFamily: '"Space Grotesk", monospace', fontSize: "11px", fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase", color: "#E3F643", textAlign: "center",
        }}>
          Wave Upfronts · Admin
        </div>

        <div style={{ border: "1px solid #2E332E", background: "#212922", padding: "36px" }}>
          <h1 style={{
            fontFamily: '"Zalando Sans Expanded", system-ui, sans-serif',
            fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em",
            color: "#FAF7F4", margin: "0 0 24px",
          }}>
            Admin Access
          </h1>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input
              name="password"
              type="password"
              autoFocus
              placeholder="Admin password"
              style={{
                background: "#0B0909", border: state?.error ? "1px solid #FA3842" : "1px solid #3F4640",
                color: "#FAF7F4", fontFamily: '"Space Grotesk", monospace',
                fontSize: "14px", padding: "13px 16px", outline: "none", width: "100%",
              }}
            />
            {state?.error && (
              <div style={{ fontFamily: '"Space Grotesk", monospace', fontSize: "12px", color: "#FA3842" }}>
                {state.error}
              </div>
            )}
            <button
              type="submit"
              disabled={isPending}
              style={{
                background: isPending ? "#2A332B" : "#E3F643", color: "#0B0909",
                border: "none", borderRadius: "999px",
                fontFamily: '"Space Grotesk", monospace', fontSize: "11px",
                fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "14px", cursor: isPending ? "not-allowed" : "pointer",
              }}
            >
              {isPending ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
