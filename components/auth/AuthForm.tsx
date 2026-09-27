"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Code2, Globe2, X } from "lucide-react";
import AppLogoMark from "@/components/app/shared/AppLogoMark";
import { signIn, signUp, useSession } from "@/lib/auth/auth-client";
import { validateAndSanitizeInput, ValidationResult } from "@/lib/validation";
import { getAuthError } from "@/lib/auth/auth-errors";
import { getSafeCallbackUrl } from "@/lib/auth/callback-url";

interface AuthFormProps {
  mode: "signin" | "signup";
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  [key: string]: string | undefined;
}

export function AuthForm({ mode }: AuthFormProps) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", passwordConfirm: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasStartedNavigation = useRef(false);
  const { data: session, isPending } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));

  const goToApp = useCallback(() => {
    if (hasStartedNavigation.current) return;

    hasStartedNavigation.current = true;
    sessionStorage.removeItem('goalgenius-logged-out');
    window.location.replace(callbackUrl);
  }, [callbackUrl]);

  useEffect(() => {
    if (!isPending && session) goToApp();
  }, [goToApp, isPending, session]);

  const validateField = (name: string, value: string): ValidationResult => {
    switch (name) {
      case "name":
        return validateAndSanitizeInput(value, "title", mode === "signup");
      case "email":
        if (!value) return { isValid: false, sanitizedValue: value, error: "Email is required" };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { isValid: false, sanitizedValue: value, error: "Please enter a valid email address" };
        }
        return { isValid: true, sanitizedValue: value };
      case "password":
        if (!value) return { isValid: false, sanitizedValue: value, error: "Password is required" };
        if (mode === "signup" && value.length < 8) {
          return { isValid: false, sanitizedValue: value, error: "Password must be at least 8 characters long" };
        }
        if (mode === "signup" && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return { isValid: false, sanitizedValue: value, error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" };
        }
        return { isValid: true, sanitizedValue: value };
      case "passwordConfirm":
        if (mode === "signup" && !value) return { isValid: false, sanitizedValue: value, error: "Please confirm your password" };
        if (mode === "signup" && value !== formData.password) return { isValid: false, sanitizedValue: value, error: "Passwords do not match" };
        return { isValid: true, sanitizedValue: value };
      default:
        return { isValid: true, sanitizedValue: value };
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const result = validateField(name, value);
    setFormData((previous) => ({ ...previous, [name]: result.sanitizedValue }));
    setErrors((previous) => ({ ...previous, [name]: result.error }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const emailValidation = validateField("email", formData.email);
    const passwordValidation = validateField("password", formData.password);
    const nameValidation = mode === "signup" ? validateField("name", formData.name) : { isValid: true, sanitizedValue: "", error: undefined };
    const passwordConfirmValidation = mode === "signup" ? validateField("passwordConfirm", formData.passwordConfirm) : { isValid: true, sanitizedValue: "", error: undefined };
    const newErrors: FormErrors = {};
    if (!emailValidation.isValid) newErrors.email = emailValidation.error;
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.error;
    if (mode === "signup" && !nameValidation.isValid) newErrors.name = nameValidation.error;
    if (mode === "signup" && !passwordConfirmValidation.isValid) newErrors.passwordConfirm = passwordConfirmValidation.error;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const result = await signIn.email({ email: emailValidation.sanitizedValue, password: passwordValidation.sanitizedValue, callbackURL: callbackUrl });
        if (result?.error) {
          setError(getAuthError(result.error, mode).message);
          setFormData((previous) => ({ ...previous, password: "", passwordConfirm: "" }));
          return;
        }
        if (!result?.data) throw new Error("Sign in failed");
        goToApp();
      } else {
        const result = await signUp.email({ email: emailValidation.sanitizedValue, password: passwordValidation.sanitizedValue, name: nameValidation.sanitizedValue, callbackURL: callbackUrl });
        if (result?.error) {
          setError(getAuthError(result.error, mode).message);
          setFormData((previous) => ({ ...previous, password: "", passwordConfirm: "" }));
          return;
        }
        if (!result?.data) throw new Error("Sign up failed");
        goToApp();
      }
    } catch (submissionError) {
      setError(getAuthError(submissionError, mode).message);
      setFormData((previous) => ({ ...previous, password: "", passwordConfirm: "" }));
    } finally {
      setLoading(false);
    }
  };

  const hasFieldErrors = Object.keys(errors).some((key) => errors[key] && (mode === "signin"
    ? ["email", "password"].includes(key)
    : ["email", "password", "passwordConfirm", "name"].includes(key)));

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="mb-8 flex items-center gap-2.5">
          <AppLogoMark className="shrink-0" />
          <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Rungset</span>
        </div>

        <h1 id="auth-title" className="text-2xl font-semibold tracking-tight text-white">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {mode === "signin" ? "Sign in to continue to Rungset." : "Start using Rungset."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {error ? (
            <div className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[rgba(255,111,130,0.3)] bg-[var(--danger-soft)] px-3 py-3" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm leading-5 text-[#ffdce2]">{error}</p>
              <button type="button" className="app-button-ghost app-button-icon app-button-sm -mr-1 -mt-1" onClick={() => setError(null)} aria-label="Dismiss error">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          {mode === "signup" ? (
            <AuthField id="name" name="name" label="Full Name" type="text" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Your name" autoComplete="name" />
          ) : null}
          <AuthField id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" autoComplete="email" />
          <div>
            <AuthField id="password" name="password" label="Password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="Enter your password" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
            {mode === "signup" && !errors.password ? <p id="password-hint" className="app-form-hint mt-1">At least 8 characters with uppercase, lowercase, and a number.</p> : null}
          </div>
          {mode === "signup" ? (
            <AuthField id="passwordConfirm" name="passwordConfirm" label="Confirm Password" type="password" value={formData.passwordConfirm} onChange={handleChange} error={errors.passwordConfirm} placeholder="Re-enter your password" autoComplete="new-password" />
          ) : null}

          <button type="submit" disabled={loading || hasFieldErrors} className="app-button w-full disabled:cursor-not-allowed">
            {loading ? (mode === "signin" ? "Signing in..." : "Creating account...") : mode === "signin" ? "Sign in" : "Sign up"}
          </button>

          <div className="flex items-center gap-3 py-1" aria-hidden="true">
            <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">or</span>
            <div className="h-px flex-1 bg-[var(--border-subtle)]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => signIn.social({ provider: "google", callbackURL: callbackUrl })} className="auth-social-button w-full">
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <span>Continue with Google</span>
            </button>
            <button type="button" onClick={() => signIn.social({ provider: "github", callbackURL: callbackUrl })} className="auth-social-button w-full">
              <Code2 className="h-4 w-4" aria-hidden="true" />
              <span>Continue with GitHub</span>
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          {mode === "signin" ? <>Don&apos;t have an account? <Link href="/auth/signup" prefetch={false} className="font-semibold text-[var(--brand-primary)] hover:text-white hover:underline">Sign up</Link></> : <>Already have an account? <Link href="/auth/signin" prefetch={false} className="font-semibold text-[var(--brand-primary)] hover:text-white hover:underline">Sign in</Link></>}
        </p>
      </section>
    </main>
  );
}

function AuthField({
  id,
  name,
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder: string;
  autoComplete: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <input id={id} name={name} type={type} value={value} onChange={onChange} required placeholder={placeholder} autoComplete={autoComplete} className={`app-field ${error ? "border-red-500" : ""}`} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} />
      {error ? <p id={errorId} className="app-form-error mt-1" role="alert">{error}</p> : null}
    </div>
  );
}
