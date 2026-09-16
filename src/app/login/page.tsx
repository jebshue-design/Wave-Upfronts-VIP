"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { login } from "../actions";

const arrowAsset = "/assets/site-arrow.svg";

export default function LoginPage() {
  const [loginReady, setLoginReady] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const [state, formAction, isPending] = useActionState(login, { error: "" });

  useEffect(() => {
    const logoTimer = window.setTimeout(() => setLogoReady(true), 3400);
    const loginTimer = window.setTimeout(() => setLoginReady(true), 4400);
    return () => {
      window.clearTimeout(logoTimer);
      window.clearTimeout(loginTimer);
    };
  }, []);

  return (
    <main className={`stinger-page${loginReady ? " login-ready" : ""}`}>
      <style>{`
        .stinger-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #000;
          display: grid;
          place-items: center;
        }

        /* ── Bold text intro ── */
        @keyframes Bold {
          0% { opacity: 0; }
          3% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes bold-block-exit {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .bold-mask {
          position: relative;
          z-index: 1;
          overflow: hidden;
          text-align: center;
        }
        .bold-title {
          margin: 0;
          color: #faf7f4;
          font: 700 clamp(44px, 8.5vw, 132px)/.95 "Zalando Sans Expanded", sans-serif;
          letter-spacing: -.025em;
          animation: bold-block-exit .5s ease 2.9s both;
        }
        .bold-line { display: block; height: .95em; }
        .bold-word { display: inline-block; opacity: 0; animation: Bold 2.68s step-end both; }
        .bold-word:nth-child(1) { animation-delay: .15s; animation-duration: 2.68s; }
        .bold-word:nth-child(2) { animation-delay: .65s; animation-duration: 2.43s; }
        .bold-line:last-child .bold-word { animation-delay: 1.15s; animation-duration: 2.18s; }
        @media (max-width: 700px) {
          .bold-mask { width: 100vw; padding: 0 6vw; }
          .bold-title { font-size: clamp(32px, 11vw, 76px); }
        }

        /* ── Logo ── */
        @keyframes login-logo-arrival {
          from { opacity: 0; transform: translate(-50%, -50%) scale(.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes login-logo-settle {
          from { transform: translate(-50%, -50%) scale(1); }
          to { transform: translate(-50%, calc(-50% - 86px)) scale(.58); }
        }
        .login-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 2;
          width: min(21vw, 270px);
          height: auto;
          animation: login-logo-arrival .55s cubic-bezier(.16,1,.3,1) both;
        }
        .stinger-page.login-ready .login-logo {
          animation: login-logo-settle 1s cubic-bezier(.16,1,.3,1) both;
        }

        /* ── Login form ── */
        @keyframes login-form-arrival {
          from { opacity: 0; transform: translate(-50%, -50%) scale(.88); filter: blur(4px); }
          65% { opacity: 1; transform: translate(-50%, -50%) scale(1.01); filter: blur(0); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
        }
        .login-form {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          animation: login-form-arrival .8s cubic-bezier(.16,1,.3,1) both;
        }
        .login-pill {
          display: flex;
          align-items: center;
          width: min(340px, calc(100vw - 48px));
          height: 48px;
          padding: 5px 6px 5px 20px;
          border: 1px solid rgba(250,247,244,.75);
          border-radius: 999px;
          background: rgba(33,41,34,.35);
          backdrop-filter: blur(18px) saturate(125%);
          -webkit-backdrop-filter: blur(18px) saturate(125%);
          transition: border-color .2s;
        }
        .login-pill.has-error { border-color: #ff6b6b; }
        .login-pill input {
          min-width: 0;
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: #faf7f4;
          font: 700 11px "Zalando Sans Expanded", sans-serif;
          letter-spacing: -.025em;
          text-transform: uppercase;
        }
        .login-pill input::placeholder { color: rgba(250,247,244,.5); }
        .login-pill button {
          flex-shrink: 0;
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          transition: background .15s;
        }
        .login-pill button:hover { background: rgba(250,247,244,.12); }
        .login-pill button:disabled { opacity: .5; cursor: wait; }
        .login-error {
          color: #ff8f8f;
          font: 400 12px "Zalando Sans", sans-serif;
          text-align: center;
        }

        /* ── Footer ── */
        .login-footer {
          position: fixed;
          bottom: 20px;
          font: 400 11px "Zalando Sans", sans-serif;
          color: rgba(244,245,240,.28);
          letter-spacing: -.025em;
          z-index: 3;
        }
      `}</style>

      {!logoReady && (
        <div className="bold-mask">
          <h1 className="bold-title">
            <span className="bold-line">
              <span className="bold-word">ON</span>{" "}
              <span className="bold-word">YOUR</span>
            </span>
            <span className="bold-line">
              <span className="bold-word">FREQUENCY</span>
            </span>
          </h1>
        </div>
      )}

      {logoReady && (
        <Image className="login-logo" src="/assets/Wave Logo.svg" alt="Wave" width={270} height={35} priority />
      )}

      {loginReady && (
        <form className="login-form" action={formAction}>
          <div className="login-pill">
            <label htmlFor="login-email" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="Email Address"
              disabled={isPending}
            />
          </div>
          <div className={`login-pill${state?.error ? " has-error" : ""}`}>
            <label htmlFor="login-password" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Event password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Event Password"
              disabled={isPending}
            />
            <button type="submit" aria-label="Submit" disabled={isPending}>
              <img src={arrowAsset} alt="" width={18} height={13} draggable={false} />
            </button>
          </div>
          {state?.error && <p className="login-error">{state.error}</p>}
        </form>
      )}

      <p className="login-footer">© 2026 Wave Sports &amp; Entertainment</p>
    </main>
  );
}
