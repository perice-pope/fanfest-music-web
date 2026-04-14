export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="skeleton h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-48" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4"><div className="skeleton h-3 w-16 mb-2" /><div className="skeleton h-6 w-12" /></div>
        ))}
      </div>
      <div className="card p-5">
        <div className="skeleton h-5 w-24 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-surface2 p-2.5">
              <div className="skeleton h-10 w-10 rounded-lg" />
              <div className="space-y-1.5 flex-1"><div className="skeleton h-3 w-20" /><div className="skeleton h-2.5 w-14" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
