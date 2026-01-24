import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full text-center space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Contact</p>
        <h1 className="font-space-grotesk text-4xl sm:text-5xl font-bold">Let’s talk strategy</h1>
        <p className="text-muted-foreground text-lg">
          For enterprise partnerships, integrations, or bespoke signal requests, our strategy team is ready to chat. Expect a response within one business day.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Email us at{' '}
            <a href="mailto:hello@adcendy.com" className="text-primary hover:underline">
              hello@adcendy.com
            </a>
          </p>
          <Link href="/" className="inline-flex">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
