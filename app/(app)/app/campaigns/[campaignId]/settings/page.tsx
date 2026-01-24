import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage campaign settings and preferences.</p>
      </div>

      <Card className="p-6 bg-card border border-border">
        <div className="text-center text-muted-foreground py-8">
          <p>Campaign settings coming soon.</p>
        </div>
      </Card>
    </div>
  );
}
