import { Card } from '@/components/ui/card';

export default function WeeklyPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Weekly</h1>
        <p className="text-muted-foreground mt-1">Weekly market intelligence updates</p>
      </div>
      <Card className="p-8 text-center border border-border bg-card">
        <p className="text-muted-foreground">Weekly content coming soon</p>
      </Card>
    </div>
  );
}
