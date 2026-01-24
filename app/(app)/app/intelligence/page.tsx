import { Card } from '@/components/ui/card';

export default function IntelligencePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Intelligence</h1>
        <p className="text-muted-foreground mt-1">Market signals and intelligence dashboard</p>
      </div>
      <Card className="p-8 text-center border border-border bg-card">
        <p className="text-muted-foreground">Intelligence content coming soon</p>
      </Card>
    </div>
  );
}
