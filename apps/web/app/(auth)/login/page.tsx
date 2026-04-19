import { LoginForm } from "./login-form";
import { AmbientOrbs } from "@/components/glass/ambient-orbs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: "var(--bg-base)" }}>
      <AmbientOrbs />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-blue mb-2">NexOps</h1>
          <p className="text-[var(--text-secondary)] text-sm">Mission control for your SaaS</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
