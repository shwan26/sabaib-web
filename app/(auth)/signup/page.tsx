"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogoMark } from "@/components/icons";
import { signUpWithPassword } from "../actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUpWithPassword, undefined);

  if (state?.status === "check-email") {
    return (
      <main className="center-main">
        <section className="join-card">
          <div className="penguin-welcome">
            <LogoMark />
            <span>📬</span>
          </div>
          <p className="eyebrow">ALMOST THERE</p>
          <h1>Check your email</h1>
          <p className="muted">We sent you a confirmation link. Click it to finish creating your account.</p>
          <Link className="back-link" href="/login">
            Back to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="center-main">
      <section className="join-card">
        <div className="penguin-welcome">
          <LogoMark />
          <span>👋</span>
        </div>
        <p className="eyebrow">CREATE ACCOUNT</p>
        <h1>Sign up</h1>
        <form action={action} className="join-form" noValidate>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          {state?.errors?.email && <p className="form-error">{state.errors.email.join(" ")}</p>}

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required />
          {state?.errors?.password && <p className="form-error">{state.errors.password.join(" ")}</p>}

          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
          {state?.errors?.confirmPassword && <p className="form-error">{state.errors.confirmPassword.join(" ")}</p>}

          {state?.message && <p className="form-error">{state.message}</p>}

          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="muted">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
