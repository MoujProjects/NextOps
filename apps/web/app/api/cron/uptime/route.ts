import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { websites, uptimeChecks } from "@/lib/db/schema";
import { logger } from "@/lib/utils/logger";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allWebsites = await db.select().from(websites);
  const results: Array<{ id: string; status: string; ms?: number }> = [];

  await Promise.allSettled(
    allWebsites.map(async (site) => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(site.url, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow",
        });
        clearTimeout(timeout);
        const responseMs = Date.now() - start;
        const status = res.ok ? "up" : "down";

        await db.insert(uptimeChecks).values({
          websiteId: site.id,
          status: status as "up" | "down",
          responseMs,
          statusCode: res.status,
        });

        await db.update(websites).set({
          lastStatus: status as "up" | "down",
          lastResponseMs: responseMs,
        }).where(eq(websites.id, site.id));

        results.push({ id: site.id, status, ms: responseMs });
      } catch (err) {
        const responseMs = Date.now() - start;
        await db.insert(uptimeChecks).values({
          websiteId: site.id,
          status: "down",
          responseMs,
          error: err instanceof Error ? err.message : "Unknown error",
        });
        await db.update(websites).set({ lastStatus: "down" }).where(eq(websites.id, site.id));
        results.push({ id: site.id, status: "down" });
        logger.warn(`Uptime check failed for ${site.url}`, err);
      }
    })
  );

  return NextResponse.json({ checked: results.length, results });
}
