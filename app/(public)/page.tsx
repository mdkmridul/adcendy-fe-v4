import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-block px-4 py-2 rounded-lg bg-card border border-border">
            <span className="text-sm font-medium text-muted-foreground">Market Intelligence Platform</span>
          </div>
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold tracking-tight">
            Transform Market Signals into Strategy
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Get comprehensive competitive intelligence and actionable recommendations in 30 minutes. Grounded in real market data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/auth/login">
            <Button size="lg" className="gap-2">
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>

        <div className="pt-12 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="text-primary font-semibold">150+</div>
              <div className="text-muted-foreground">Signals Tracked</div>
            </div>
            <div className="space-y-2">
              <div className="text-accent font-semibold">30 Min</div>
              <div className="text-muted-foreground">Strategy Reports</div>
            </div>
            <div className="space-y-2">
              <div className="text-secondary font-semibold">99%</div>
              <div className="text-muted-foreground">Data Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
