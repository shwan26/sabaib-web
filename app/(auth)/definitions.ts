import * as z from "zod";

export const SignupSchema = z
  .object({
    email: z.email({ error: "Please enter a valid email." }).trim(),
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters." })
      .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
      .regex(/[0-9]/, { error: "Password must contain at least one number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Enter your password." }),
});

export const MagicLinkSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
});

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      status?: "check-email";
    }
  | undefined;
