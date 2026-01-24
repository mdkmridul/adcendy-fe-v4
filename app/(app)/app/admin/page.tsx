import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="p-6">
      <Card className="p-8 max-w-4xl">
        <h1 className="font-space-grotesk text-3xl font-bold mb-2">Administration</h1>
        <p className="text-muted-foreground mb-6">
          System administration and platform management tools.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/app/admin/jobs">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Jobs Manager
            </Button>
          </Link>
          <Link href="/app/admin/ai-usage">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              AI Usage Analytics
            </Button>
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          This page is protected for ADMIN roles only.
        </div>
      </Card>
    </div>
  );
}
