import { AuthLandingPage } from "../components/auth/auth-landing-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[]; demo?: string | string[] }>;
}) {
  const { mode, demo } = await searchParams;
  return (
    <AuthLandingPage
      initialMode={mode === "signup" ? "signup" : "login"}
      demoExpired={demo === "expired"}
    />
  );
}
