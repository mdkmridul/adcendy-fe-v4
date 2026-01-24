'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Unauthorized() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-space-grotesk text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don't have permission to access this resource. Your role doesn't have the required access level.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.back()} variant="default">
            Go Back
          </Button>
          <Link href="/app/campaigns">
            <Button variant="outline" className="w-full bg-transparent">
              Return to Campaigns
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    </div>
  );
}
