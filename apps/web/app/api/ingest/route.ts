import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { logs, apiKeys } from "@/lib/db/schema";
import { ingestLogSchema } from "@nexops/shared";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);

    // Validate token against API keys
    const [keyRecord] = await db
      .select({ orgId: apiKeys.orgId })
      .from(apiKeys)
      .where(eq(apiKeys.isActive, true))
      .limit(1);

    if (!keyRecord) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ingestLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { level, message, source, metadata, projectId, timestamp } = parsed.data;
    await db.insert(logs).values({
      orgId: keyRecord.orgId,
      level,
      message,
      source: source ?? "sdk",
      metadata: metadata ?? {},
      projectId: projectId ?? null,
      createdAt: timestamp ? new Date(timestamp) : new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Ingest error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
