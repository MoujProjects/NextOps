import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { apiKeys, apiCalls } from "@/lib/db/schema";
import { decryptApiKey } from "@/lib/crypto/vault";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com",
  anthropic: "https://api.anthropic.com",
  stripe: "https://api.stripe.com",
  resend: "https://api.resend.com",
  github: "https://api.github.com",
};

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  const start = Date.now();
  const [provider, ...rest] = params.path;
  const keyId = req.headers.get("x-nexops-key-id");

  if (!provider || !keyId) {
    return NextResponse.json({ error: "Missing provider or key ID" }, { status: 400 });
  }

  try {
    const [keyRecord] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.isActive, true)))
      .limit(1);

    if (!keyRecord) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    const plainKey = await decryptApiKey(keyRecord.keyCiphertext, keyRecord.keyIv, keyRecord.orgId);
    const baseUrl = PROVIDER_BASE_URLS[provider];
    if (!baseUrl) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    const targetPath = rest.join("/");
    const targetUrl = `${baseUrl}/${targetPath}${req.nextUrl.search}`;

    // Forward headers minus nexops-specific ones
    const headers = new Headers(req.headers);
    headers.delete("x-nexops-key-id");
    headers.set("Authorization", `Bearer ${plainKey}`);
    headers.delete("host");

    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined;

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const latencyMs = Date.now() - start;

    // Log the call (fire and forget)
    db.insert(apiCalls).values({
      keyId: keyRecord.id,
      orgId: keyRecord.orgId,
      endpoint: `/${targetPath}`,
      method: req.method,
      statusCode: upstream.status,
      latencyMs,
    }).catch((err) => logger.error("Failed to log api call", err));

    // Update last used
    db.update(apiKeys).set({ lastUsed: new Date() }).where(eq(apiKeys.id, keyRecord.id))
      .catch((err) => logger.error("Failed to update lastUsed", err));

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set("x-nexops-latency", String(latencyMs));

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    logger.error("Proxy error", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
