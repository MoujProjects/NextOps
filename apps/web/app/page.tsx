import Link from "next/link";
import { AmbientOrbs } from "@/components/glass/ambient-orbs";
import {
  Activity, Shield, Zap, BarChart3, Globe, Key,
  Bell, ArrowRight, ChevronRight, CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: <Activity className="w-5 h-5" />,
    title: "API Monitoring",
    description: "Track every API call across OpenAI, Stripe, Twilio and more. Real-time latency, error rates, and cost breakdowns.",
  },
  {
    icon: <Key className="w-5 h-5" />,
    title: "Encrypted Key Vault",
    description: "Store and rotate API keys with AES-256 encryption. One dashboard for all your third-party credentials.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Uptime Monitoring",
    description: "Automated health checks for all your endpoints. Instant alerts when something goes down.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Cost Analytics",
    description: "See exactly what you're spending per provider, per project. Set budgets and get alerts before you overspend.",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Smart Alerts",
    description: "Configurable alert rules with severity levels. Get notified via email or webhook when things break.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Team & RBAC",
    description: "Invite your team with role-based access. Owners, admins, developers, and viewers — all scoped to your org.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<50ms", label: "Proxy Latency" },
  { value: "11+", label: "Providers" },
  { value: "256-bit", label: "Encryption" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <AmbientOrbs />

      {/* Nav */}
      <header className="relative z-20 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--text-primary)]">NexOps</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-violet)] text-white px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-mint)] animate-pulse" />
          <span className="text-xs font-medium text-[var(--accent-blue)]">Now in public beta</span>
        </div>

        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
          <span className="text-[var(--text-primary)]">Mission control</span>
          <br />
          <span className="bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-violet)] to-[var(--accent-mint)] bg-clip-text text-transparent">
            for your SaaS
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Monitor APIs, manage keys, track costs, and keep your entire stack healthy — all from one dark-mode command center built for indie hackers and small teams.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-violet)] text-white font-semibold px-8 py-3.5 rounded-xl text-base hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(79,141,255,0.3)]"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium px-6 py-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-all text-base"
          >
            Sign in to dashboard
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Everything you need to ship with confidence
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Stop juggling provider dashboards. NexOps unifies monitoring, security, and cost management into a single pane of glass.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass rounded-xl p-6 hover:border-[var(--border-strong)] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 flex items-center justify-center text-[var(--accent-blue)] mb-4 group-hover:shadow-[0_0_15px_rgba(79,141,255,0.2)] transition-shadow">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="glass rounded-2xl p-12 text-center border border-[var(--accent-blue)]/10">
          <h2 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-4">
            Ready to take control?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
            Join the beta and start monitoring your SaaS in under 2 minutes. Free tier included.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-violet)] text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-mint)]" />No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-mint)]" />Free tier forever</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-mint)]" />Setup in 2 minutes</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-[var(--text-muted)]">NexOps</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">&copy; {new Date().getFullYear()} NexOps. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
