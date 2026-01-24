import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function ReviewPage() {
  return (
    <div className="p-6">
      <Card className="p-8 max-w-2xl">
        <h1 className="font-space-grotesk text-3xl font-bold mb-2">Review Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Advanced review and strategy analysis tools for reviewers.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This page is protected for REVIEWER and ADMIN roles only.
          </p>
          <Link href="/app/campaigns">
            <Button variant="outline">Back to Campaigns</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
