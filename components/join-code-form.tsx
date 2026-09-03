"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons";

export default function JoinCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) { setError("Enter your bill code."); return; }
    router.push(`/join/${normalized}`);
  }

  return (
    <form onSubmit={submit} className="code-form" noValidate>
      <div className="code-form-row">
        <input
          value={code}
          onChange={(event) => { setCode(event.target.value); setError(""); }}
          placeholder="e.g. B7X2KP"
          aria-label="Bill code"
          autoCapitalize="characters"
          autoComplete="off"
          aria-describedby={error ? "code-form-error" : undefined}
        />
        <button className="primary-button" type="submit">
          Join <ArrowRightIcon />
        </button>
      </div>
      {error && <p className="form-error" id="code-form-error">{error}</p>}
    </form>
  );
}
