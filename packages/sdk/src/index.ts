export type Provider =
  | "openai" | "anthropic" | "stripe" | "twilio" | "sendgrid"
  | "mapbox" | "resend" | "github" | "vercel" | "supabase" | "custom";

export interface NexopsTrackEvent {
  provider: Provider;
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  tokensUsed?: number;
  costCents?: number;
  projectId?: string;
  metadata?: Record<string, unknown>;
}

export interface NexopsConfig {
  apiKey: string;
  endpoint?: string;
  projectId?: string;
  debug?: boolean;
}

export interface TrackOptions {
  provider: Provider;
  projectId?: string;
  metadata?: Record<string, unknown>;
}

export class NexopsClient {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly projectId?: string;
  private readonly debug: boolean;

  constructor(config: NexopsConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint ?? "https://app.nexops.dev";
    this.projectId = config.projectId;
    this.debug = config.debug ?? false;
  }

  async track<T>(fn: () => Promise<T>, options: TrackOptions): Promise<T> {
    const start = Date.now();
    let statusCode = 200;
    let result: T;

    try {
      result = await fn();
    } catch (err) {
      statusCode = 500;
      const latencyMs = Date.now() - start;
      await this.send({
        provider: options.provider,
        endpoint: "unknown",
        method: "unknown",
        statusCode,
        latencyMs,
        projectId: options.projectId ?? this.projectId,
        metadata: options.metadata,
      });
      throw err;
    }

    const latencyMs = Date.now() - start;
    await this.send({
      provider: options.provider,
      endpoint: "unknown",
      method: "unknown",
      statusCode,
      latencyMs,
      projectId: options.projectId ?? this.projectId,
      metadata: options.metadata,
    });

    return result;
  }

  async log(
    level: "info" | "warn" | "error" | "debug",
    message: string,
    metadata?: Record<string, unknown>,
    projectId?: string
  ): Promise<void> {
    try {
      await fetch(`${this.endpoint}/api/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          level,
          message,
          metadata,
          projectId: projectId ?? this.projectId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      if (this.debug) {
        console.error("[nexops:sdk] failed to send log", err);
      }
    }
  }

  private async send(event: NexopsTrackEvent): Promise<void> {
    try {
      await fetch(`${this.endpoint}/api/ingest/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(event),
      });
    } catch (err) {
      if (this.debug) {
        console.error("[nexops:sdk] failed to send event", err);
      }
    }
  }
}

export function createNexops(config: NexopsConfig): NexopsClient {
  return new NexopsClient(config);
}

