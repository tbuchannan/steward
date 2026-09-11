import { CalendarDays, LockKeyhole } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

function Brand({ mobile = false }: { mobile?: boolean }) {
  return (
    <a
      aria-label="Steward home"
      className={cn(
        "w-fit items-center gap-3 text-foreground no-underline",
        mobile ? "mb-8 inline-flex min-[801px]:hidden" : "inline-flex",
      )}
      href="/"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-full border border-foreground/20 bg-white/50"
      >
        <CalendarDays className="size-[17px]" strokeWidth={1.7} />
      </span>
      <span className="font-display text-[1.75rem] leading-none">Steward</span>
    </a>
  );
}

function AuthLandingPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const isSignup = mode === "signup";

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage("");
    setPasswordVisible(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    setMessage(
      isSignup
        ? "Account form is ready to connect to your API."
        : "Login form is ready to connect to your API.",
    );
  };

  return (
    <main className="steward-canvas min-h-screen min-[801px]:grid min-[801px]:grid-cols-[minmax(17rem,1fr)_minmax(30rem,1.16fr)]">
      <section
        aria-labelledby="brand-heading"
        className="hidden h-screen flex-col justify-between self-start border-r border-foreground/10 p-[clamp(2rem,5vw,5rem)] min-[801px]:sticky min-[801px]:top-0 min-[801px]:flex"
      >
        <Brand />

        <div className="max-w-136 py-20">
          <p className="mb-[1.2rem] text-xs font-bold tracking-[0.16em] text-primary uppercase">
            Personal finance, clearly understood
          </p>
          <h1
            className="font-display m-0 text-[clamp(3.4rem,6vw,6.5rem)] leading-[0.94] font-medium tracking-tighter"
            id="brand-heading"
          >
            Your money,
            <br />
            made clear.
          </h1>
          <p className="mt-7 max-w-md text-[1.06rem] leading-[1.7] text-muted-foreground">
            Bring your accounts, spending, and budgets into one calm place—then
            make decisions with confidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-[0.82rem] text-muted-foreground">
          <LockKeyhole
            aria-hidden="true"
            className="size-[17px] shrink-0"
            strokeWidth={1.7}
          />
          <span>Your financial information stays private and secure.</span>
        </div>
      </section>

      <section
        aria-label="Account access"
        className="grid min-h-svh place-items-center bg-card/60 p-5 min-[801px]:p-[clamp(1.5rem,5vw,5rem)]"
      >
        <Card className="w-full max-w-124 gap-0 rounded-[1.4rem] border-foreground/10 bg-card/75 p-6 shadow-[0_28px_80px_rgb(29_56_44/0.12)] backdrop-blur-[18px] min-[801px]:p-[clamp(1.7rem,4vw,3rem)]">
          <Brand mobile />

          <CardHeader className="gap-0 p-0">
            <CardTitle
              className="font-display text-[2.35rem] leading-tight font-medium tracking-tight"
              id="form-title"
            >
              {isSignup ? "Create your account" : "Welcome back"}
            </CardTitle>
            <CardDescription
              className="mt-2 mb-7 text-base leading-[1.55]"
              id="form-intro"
            >
              {isSignup
                ? "Start building a clearer view of your money."
                : "Sign in to continue to your financial overview."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div
              aria-label="Account action"
              className="mb-7 grid grid-cols-2 gap-1 rounded-[0.85rem] border border-border bg-secondary/70 p-1"
              role="tablist"
            >
              <Button
                aria-controls="auth-form"
                aria-selected={!isSignup}
                className="min-h-11 rounded-[0.65rem] text-muted-foreground shadow-none aria-selected:bg-card aria-selected:text-foreground aria-selected:shadow-[0_2px_10px_rgb(24_52_41/0.08)]"
                id="login-tab"
                onClick={() => changeMode("login")}
                role="tab"
                variant="ghost"
              >
                Log in
              </Button>
              <Button
                aria-controls="auth-form"
                aria-selected={isSignup}
                className="min-h-11 rounded-[0.65rem] text-muted-foreground shadow-none aria-selected:bg-card aria-selected:text-foreground aria-selected:shadow-[0_2px_10px_rgb(24_52_41/0.08)]"
                id="signup-tab"
                onClick={() => changeMode("signup")}
                role="tab"
                variant="ghost"
              >
                Create account
              </Button>
            </div>

            <form
              className="grid gap-4"
              id="auth-form"
              noValidate
              onSubmit={handleSubmit}
            >
              {isSignup && (
                <div className="grid gap-2">
                  <label className="text-sm font-semibold" htmlFor="name">
                    Full name
                  </label>
                  <Input
                    autoComplete="name"
                    className="min-h-[3.15rem] rounded-[0.72rem] bg-white/80 px-4 text-base hover:border-foreground/30 focus-visible:bg-white"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <label className="text-sm font-semibold" htmlFor="email">
                  Email address
                </label>
                <Input
                  autoComplete="email"
                  className="min-h-[3.15rem] rounded-[0.72rem] bg-white/80 px-4 text-base hover:border-foreground/30 focus-visible:bg-white"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-baseline justify-between gap-4">
                  <label className="text-sm font-semibold" htmlFor="password">
                    Password
                  </label>
                  {!isSignup && (
                    <Button
                      className="h-auto p-0 text-[0.84rem] font-semibold"
                      onClick={() =>
                        setMessage("Password reset would open here.")
                      }
                      variant="link"
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    className="min-h-[3.15rem] rounded-[0.72rem] bg-white/80 px-4 pr-18 text-base hover:border-foreground/30 focus-visible:bg-white"
                    id="password"
                    minLength={8}
                    name="password"
                    placeholder={
                      isSignup ? "Create a password" : "Enter your password"
                    }
                    required
                    type={passwordVisible ? "text" : "password"}
                  />
                  <Button
                    aria-label={
                      passwordVisible ? "Hide password" : "Show password"
                    }
                    className="absolute top-1/2 right-2 h-auto -translate-y-1/2 px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => setPasswordVisible((visible) => !visible)}
                    variant="ghost"
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </Button>
                </div>
                {isSignup && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Use at least 8 characters.
                  </p>
                )}
              </div>

              {message && (
                <p
                  className="m-0 rounded-[0.65rem] bg-accent px-3 py-3 text-sm text-primary"
                  role="status"
                >
                  {message}
                </p>
              )}

              <Button
                className="mt-1 min-h-[3.2rem] rounded-[0.72rem] font-bold shadow-[0_8px_18px_rgb(31_111_74/0.18)] hover:-translate-y-px hover:shadow-[0_11px_22px_rgb(31_111_74/0.22)] active:translate-y-0"
                type="submit"
              >
                {isSignup ? "Create account" : "Log in"}
              </Button>

              <div
                aria-hidden="true"
                className="flex items-center gap-3 text-center text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border before:content-[''] after:h-px after:flex-1 after:bg-border after:content-['']"
              >
                or
              </div>

              <Button
                className="min-h-[3.2rem] rounded-[0.72rem] border-foreground/35 bg-white/60 font-bold hover:-translate-y-px hover:border-primary hover:bg-accent active:translate-y-0"
                onClick={() => setMessage("Opening a read-only demo account…")}
                variant="outline"
              >
                Try the demo account
              </Button>
            </form>

            {isSignup && (
              <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-[1.55] text-muted-foreground">
                By creating an account, you agree to Steward’s{" "}
                <a className="underline underline-offset-2" href="#terms">
                  Terms
                </a>{" "}
                and acknowledge the{" "}
                <a className="underline underline-offset-2" href="#privacy">
                  Privacy Policy
                </a>
                .
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export { AuthLandingPage };
