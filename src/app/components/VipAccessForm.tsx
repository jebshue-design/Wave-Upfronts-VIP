"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function VipAccessForm() {
  const [state, formAction, isPending] = useActionState(login, { error: "" });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <form
        action={formAction}
        style={{
          display: "flex",
          alignItems: "center",
          width: "min(100%, 286px)",
          height: "31px",
          padding: "0 8px 0 16px",
          border: state?.error ? "1px solid #ff6b6b" : "1px solid rgba(255, 255, 255, 0.82)",
          borderRadius: "999px",
          transition: "border-color 180ms ease",
        }}
      >
        <label htmlFor="vip-email" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Email address
        </label>
        <input
          id="vip-email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="ENTER YOUR EMAIL"
          disabled={isPending}
          style={{
            minWidth: 0,
            width: "100%",
            flex: 1,
            border: 0,
            outline: 0,
            background: "transparent",
            color: "#ffffff",
            padding: 0,
            fontFamily: '"Zalando Sans Expanded", sans-serif',
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        />
        <button
          type="submit"
          aria-label="Submit email"
          disabled={isPending}
          style={{
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            width: "24px",
            height: "24px",
            padding: 0,
            border: 0,
            background: "transparent",
            color: "#ffffff",
            cursor: isPending ? "wait" : "pointer",
          }}
        >
          <img src="/assets/site-arrow.svg" alt="" width="18" height="13" />
        </button>
      </form>
      {state?.error && (
        <p style={{ margin: 0, color: "#ffb0b0", fontFamily: '"Zalando Sans", sans-serif', fontSize: "11px" }}>
          {state.error}
        </p>
      )}
    </div>
  );
}
