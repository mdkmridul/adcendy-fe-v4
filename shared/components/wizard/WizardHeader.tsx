import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardHeaderProps {
  campaignName: string;
  campaignId: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onBack?: () => void;
}

export function WizardHeader({ campaignName, campaignId, saveStatus, onBack }: WizardHeaderProps) {
  const statusText = {
    idle: '',
    saving: 'Saving...',
    saved: 'Saved ✓',
    error: 'Save failed',
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <Link href={`/app/campaigns/${campaignId}/overview`}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-space-grotesk text-2xl font-bold text-foreground">Setup</h1>
          <p className="text-sm text-muted-foreground">{campaignName}</p>
        </div>
      </div>

      {saveStatus !== 'idle' && (
        <div
          className={cn('text-sm font-medium', {
            'text-muted-foreground': saveStatus === 'saving',
            'text-green-600': saveStatus === 'saved',
            'text-destructive': saveStatus === 'error',
          })}
        >
          {statusText[saveStatus]}
        </div>
      )}
    </div>
  );
}
