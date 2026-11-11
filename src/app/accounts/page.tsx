import { redirect } from "next/navigation";

import AccountsScreen from "./accounts-screen";
import { getSession } from "../../server/session";
import { getRuntime } from "../../server/runtime";
import { DemoGuard } from "../../components/auth/demo-guard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/");
  const status = await getRuntime().demo.status(session);
  // Expired demos receive only the lifecycle shell, never protected content.
  return (
    <DemoGuard initialStatus={status}>
      {!status.isDemo || status.state === "active" ? <AccountsScreen /> : null}
    </DemoGuard>
  );
}
