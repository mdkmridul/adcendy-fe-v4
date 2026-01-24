import { Card } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-60 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      <div className="h-10 w-full bg-muted animate-pulse rounded" />

      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 bg-card animate-pulse h-24" />
        ))}
      </div>
    </div>
  );
}
