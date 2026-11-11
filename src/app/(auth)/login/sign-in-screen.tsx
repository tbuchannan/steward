"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { authClient } from "@/lib/auth-client";

type SignInFields = {
  email: string;
  password: string;
};

const SignInScreen = () => {
  const router = useRouter();
  const session = authClient.useSession();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignInFields>();

  useEffect(() => {
    if (session.data) router.replace("/accounts");
  }, [router, session.data]);

  const submit = handleSubmit(async (fields) => {
    setSubmissionError(null);
    const result = await authClient.signIn.email({
      email: fields.email.trim(),
      password: fields.password,
    });

    if (result.error) {
      setSubmissionError("The email address or password is incorrect.");
      return;
    }

    router.replace("/accounts");
    router.refresh();
  });

  return (
    <main className="auth-layout">
      <section className="auth-card" aria-labelledby="sign-in-title">
        <Link className="wordmark" href="/">
          Steward
        </Link>
        <p className="eyebrow">Welcome back</p>
        <h1 id="sign-in-title">Sign in to Steward.</h1>

        <form className="auth-form" onSubmit={submit} noValidate>
          <label>
            Email address
            <input
              autoComplete="email"
              inputMode="email"
              type="email"
              {...register("email", {
                required: "Enter your email address.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </label>

          <label>
            Password
            <input
              autoComplete="current-password"
              type="password"
              {...register("password", {
                required: "Enter your password.",
              })}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>

          {submissionError && (
            <p className="form-error" role="alert">
              {submissionError}
            </p>
          )}

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-alternative">
          New to Steward? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default SignInScreen;
