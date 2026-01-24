import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SampleReportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full text-center space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Sample report</p>
        <h1 className="font-space-grotesk text-4xl sm:text-5xl font-bold">Sample report coming soon</h1>
        <p className="text-muted-foreground text-lg">
          We are polishing a live sample so you can peek into the type of insights you get from AdCendy. Check back shortly or reach out to our team.
        </p>
        <div className="flex justify-center">
          <Link href="/" className="inline-flex">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
