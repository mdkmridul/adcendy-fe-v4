'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Check } from 'lucide-react';

type DemoResult = {
  signals: Array<{ label: string; value: string; trend: number }>;
  recommendation: string;
} | null;

export function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [demoResult, setDemoResult] = useState<DemoResult>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [city, setCity] = useState('San Francisco');
  const [niche, setNiche] = useState('SaaS');
  const [budget, setBudget] = useState('$50K-100K');

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.65;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];
    const particleCount = 40;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: Math.random() * 0.5 + 0.5,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#060713');
      gradient.addColorStop(0.5, '#0a0f22');
      gradient.addColorStop(1, '#060713');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.002;

        if (p.life <= 0) {
          particles[i] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            life: 1,
          };
          return;
        }

        // Draw particle
        const opacity = Math.min(p.life, 0.6);
        ctx.fillStyle = `rgba(91, 140, 255, ${opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.15;
            ctx.strokeStyle = `rgba(91, 140, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.65;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    await new Promise(r => setTimeout(r, 1200));

    setDemoResult({
      signals: [
        { label: 'SERP Gaps', value: '+12', trend: 5 },
        { label: 'Paid Opportunity', value: '$2.3M', trend: 8 },
        { label: 'Reviews Rank', value: '#4', trend: 2 },
      ],
      recommendation: `Expand paid ads in ${city} ${niche} market with focus on mid-market buyers.`,
    });
    setIsSimulating(false);
  };

  return (
    <section className="relative w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: 'block' }}
      />

      {/* Gradient beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-teal-500/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="font-space-grotesk text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Market signals into winning strategy
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Get actionable competitive intelligence in 30 minutes. Real market signals. Versioned outputs. Weekly improvements.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-all">
                Generate Strategy
              </button>
              <button className="px-8 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-card transition-all">
                View Sample
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Grounded in real signals</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Versioned outputs (v1, v2...)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Weekly updates</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Micro Demo Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="font-space-grotesk text-xl font-semibold text-foreground">Mini Strategy Simulator</h3>
                <p className="text-sm text-muted-foreground">Try AdCendy in 30 seconds</p>
              </div>

              {!demoResult ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    >
                      <option>San Francisco</option>
                      <option>New York</option>
                      <option>London</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Niche</label>
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    >
                      <option>SaaS</option>
                      <option>E-commerce</option>
                      <option>FinTech</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Budget</label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    >
                      <option>$10K-25K</option>
                      <option>$50K-100K</option>
                      <option>$100K+</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                      isSimulating
                        ? 'bg-primary/50 text-white'
                        : 'bg-primary text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSimulating ? 'Analyzing market...' : 'Simulate'}
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    {demoResult.signals.map((signal, idx) => (
                      <div key={idx} className="bg-background/50 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">{signal.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{signal.value}</span>
                          <TrendingUp className="w-3 h-3 text-accent" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                    <p className="text-xs font-semibold text-accent mb-2">Recommendation</p>
                    <p className="text-sm text-foreground leading-relaxed">{demoResult.recommendation}</p>
                  </div>

                  <button className="w-full py-2 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm">
                    Open Full Report
                  </button>

                  <button
                    onClick={() => setDemoResult(null)}
                    className="w-full py-2 px-4 border border-border text-foreground rounded-lg font-semibold hover:bg-card transition-all text-sm"
                  >
                    Try Another
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
