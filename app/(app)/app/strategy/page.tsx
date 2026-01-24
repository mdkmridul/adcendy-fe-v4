import { Card } from '@/components/ui/card';

export default function StrategyPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Strategy</h1>
        <p className="text-muted-foreground mt-1">View and analyze generated strategies</p>
      </div>
      <Card className="p-8 text-center border border-border bg-card">
        <p className="text-muted-foreground">Strategy content coming soon</p>
      </Card>
    </div>
  );
}
