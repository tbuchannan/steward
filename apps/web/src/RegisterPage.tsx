import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { authClient } from "./auth-client.ts";

type RegistrationFields = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<RegistrationFields>();

  const submit = handleSubmit(async (fields) => {
    setSubmissionError(null);

    if (fields.password !== fields.passwordConfirmation) {
      setError("passwordConfirmation", {
        message: "Passwords must match.",
      });
      return;
    }

    const result = await authClient.signUp.email({
      name: fields.name.trim(),
      email: fields.email.trim(),
      password: fields.password,
    });

    if (result.error) {
      setSubmissionError(
        result.error.message ?? "Registration failed. Please try again.",
      );
      return;
    }

    await navigate({ to: "/accounts", replace: true });
  });

  return (
    <main className="auth-layout">
      <section className="auth-card" aria-labelledby="register-title">
        <Link className="wordmark" to="/">
          Steward
        </Link>
        <p className="eyebrow">Create your account</p>
        <h1 id="register-title">Start understanding your money.</h1>
        <p className="auth-introduction">
          Record and organize your finances without connecting a bank account.
        </p>

        <form className="auth-form" onSubmit={submit} noValidate>
          <label>
            Name
            <input
              autoComplete="name"
              {...register("name", {
                required: "Enter your name.",
                maxLength: {
                  value: 100,
                  message: "Use 100 characters or fewer.",
                },
              })}
            />
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
          </label>

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
              autoComplete="new-password"
              type="password"
              {...register("password", {
                required: "Create a password.",
                minLength: {
                  value: 8,
                  message: "Use at least 8 characters.",
                },
              })}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>

          <label>
            Confirm password
            <input
              autoComplete="new-password"
              type="password"
              {...register("passwordConfirmation", {
                required: "Confirm your password.",
              })}
            />
            {errors.passwordConfirmation && (
              <span className="field-error">
                {errors.passwordConfirmation.message}
              </span>
            )}
          </label>

          {submissionError && (
            <p className="form-error" role="alert">
              {submissionError}
            </p>
          )}

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-alternative">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
