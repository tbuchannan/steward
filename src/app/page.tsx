import { AuthLandingPage } from "../components/auth/auth-landing-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { mode } = await searchParams;
  return (
    <AuthLandingPage initialMode={mode === "signup" ? "signup" : "login"} />
  );
}
