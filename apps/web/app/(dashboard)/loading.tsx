export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-40 bg-[var(--surface-active)] rounded-lg" />
        <div className="h-4 w-64 bg-[var(--surface)] rounded-lg mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-5 h-28">
            <div className="h-3 w-20 bg-[var(--surface-active)] rounded mb-3" />
            <div className="h-7 w-24 bg-[var(--surface-active)] rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-xl h-64" />
        <div className="glass rounded-xl h-64" />
      </div>
    </div>
  );
}
