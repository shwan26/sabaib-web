"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LoginSchema, MagicLinkSchema, SignupSchema, type FormState } from "./definitions";

async function siteOrigin() {
  return (await headers()).get("origin") ?? "";
}

export async function signUpWithPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const validated = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!validated.success) return { errors: flattenFieldErrors(validated.error) };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { message: "Supabase is not configured." };

  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback` },
  });
  if (error) return { message: error.message };

  return { status: "check-email" };
}

export async function signInWithPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validated.success) return { errors: flattenFieldErrors(validated.error) };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { message: "Supabase is not configured." };

  const { error } = await supabase.auth.signInWithPassword(validated.data);
  if (error) return { message: error.message };

  redirect("/");
}

export async function requestMagicLink(_state: FormState, formData: FormData): Promise<FormState> {
  const validated = MagicLinkSchema.safeParse({ email: formData.get("email") });
  if (!validated.success) return { errors: flattenFieldErrors(validated.error) };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { message: "Supabase is not configured." };

  const { error } = await supabase.auth.signInWithOtp({
    email: validated.data.email,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback` },
  });
  if (error) return { message: error.message };

  return { status: "check-email" };
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

function flattenFieldErrors<T extends Record<string, unknown>>(error: ZodError<T>) {
  const flattened = error.flatten().fieldErrors;
  const errors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flattened)) if (value) errors[key] = value;
  return errors;
}
