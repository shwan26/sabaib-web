"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogoMark } from "@/components/icons";
import { requestMagicLink, signInWithPassword } from "../actions";

export default function LoginPage() {
  const [passwordState, passwordAction, passwordPending] = useActionState(signInWithPassword, undefined);
  const [magicLinkState, magicLinkAction, magicLinkPending] = useActionState(requestMagicLink, undefined);

  return (
    <main className="center-main">
      <section className="join-card">
        <div className="penguin-welcome">
          <LogoMark />
          <span>👋</span>
        </div>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in</h1>

        <form action={passwordAction} className="join-form" noValidate>
          <label htmlFor="login-email">Email</label>
          <input id="login-email" name="email" type="email" autoComplete="email" required />
          {passwordState?.errors?.email && <p className="form-error">{passwordState.errors.email.join(" ")}</p>}

          <label htmlFor="login-password">Password</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required />
          {passwordState?.errors?.password && (
            <p className="form-error">{passwordState.errors.password.join(" ")}</p>
          )}

          {passwordState?.message && <p className="form-error">{passwordState.message}</p>}

          <button className="primary-button" type="submit" disabled={passwordPending}>
            {passwordPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="muted">Or use a magic link</p>

        {magicLinkState?.status === "check-email" ? (
          <p className="muted">We sent you a magic link. Check your email to sign in.</p>
        ) : (
          <form action={magicLinkAction} className="join-form" noValidate>
            <label htmlFor="magic-email">Email</label>
            <input id="magic-email" name="email" type="email" autoComplete="email" required />
            {magicLinkState?.errors?.email && <p className="form-error">{magicLinkState.errors.email.join(" ")}</p>}
            {magicLinkState?.message && <p className="form-error">{magicLinkState.message}</p>}

            <button type="submit" disabled={magicLinkPending}>
              {magicLinkPending ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}

        <p className="muted">
          Don&rsquo;t have an account? <Link href="/signup">Create one</Link>
        </p>
      </section>
    </main>
  );
}
