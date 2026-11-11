import { redirect } from "next/navigation";

import AccountsScreen from "./accounts-screen";
import { getSession } from "../../server/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/");
  return <AccountsScreen />;
}
