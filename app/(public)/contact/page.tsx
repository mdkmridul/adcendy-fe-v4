'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BUSINESS_TERMS } from '@/shared/marketing/business-terms';
import { getSupportContact } from '@/shared/support/support-contact';

export default function ContactPage() {
  const support = getSupportContact();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full text-center space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Contact</p>
        <h1 className="font-space-grotesk text-4xl sm:text-5xl font-bold">Let’s talk strategy</h1>
        <p className="text-muted-foreground text-lg">
          For enterprise partnerships, integrations, or bespoke signal requests, our strategy team is ready to chat. Expect a response within {BUSINESS_TERMS.contactResponse}.
        </p>
        <div className="space-y-3">
          {support && (
            <p className="text-sm text-muted-foreground">
              {support.isEmail ? 'Email us at ' : 'Reach us through '}
              <a
                href={support.href}
                className="text-primary hover:underline"
                {...(support.isEmail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {support.label}
              </a>
            </p>
          )}
          <Link href="/" className="inline-flex">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
