export default function ApprovalsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}
