import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { authClient } from "./auth-client.ts";

const AccountsPage = () => {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [signOutError, setSignOutError] = useState(false);

  useEffect(() => {
    if (!session.isPending && !session.data) {
      void navigate({ to: "/login", replace: true });
    }
  }, [navigate, session.data, session.isPending]);

  if (session.isPending) {
    return (
      <main className="session-status" aria-live="polite">
        Checking your session…
      </main>
    );
  }

  if (!session.data) {
    return (
      <main className="session-status" aria-live="polite">
        Returning to sign in…
      </main>
    );
  }

  const signOut = async () => {
    setSignOutError(false);
    const result = await authClient.signOut();
    if (result.error) {
      setSignOutError(true);
      return;
    }
    await navigate({ to: "/login", replace: true });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="wordmark app-wordmark" to="/accounts">
          Steward
        </Link>
        <div className="user-menu">
          <span>{session.data.user.name}</span>
          <button className="secondary-button" onClick={signOut} type="button">
            Sign out
          </button>
        </div>
      </header>
      <main className="accounts-page">
        <p className="eyebrow">Protected application</p>
        <h1>Financial accounts</h1>
        <div className="empty-state">
          <h2>You’re signed in.</h2>
          <p>
            Your session is protected by the server and persisted in a secure
            cookie. Creating and viewing financial accounts arrives in #159.
          </p>
        </div>
        {signOutError && (
          <p className="form-error" role="alert">
            Sign out failed. Please try again.
          </p>
        )}
      </main>
    </div>
  );
};

export default AccountsPage;
