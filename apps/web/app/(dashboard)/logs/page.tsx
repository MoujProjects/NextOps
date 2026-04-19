import { requireUserWithOrg } from "@/lib/supabase/server";
import { getOrgLogs } from "@/lib/db/queries";
import { LogsClient } from "./logs-client";

export default async function LogsPage() {
  const { org } = await requireUserWithOrg();
  const logsData = await getOrgLogs(org.id, 200);

  const serialized = logsData.map((l) => ({
    id: l.id,
    level: l.level,
    message: l.message,
    source: l.source ?? "unknown",
    metadata: l.metadata ?? {},
    createdAt: l.createdAt.toISOString(),
  }));

  return <LogsClient logs={serialized} />;
}
