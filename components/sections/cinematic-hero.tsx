'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Target } from 'lucide-react';

export function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.7;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }> = [];

    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    const animate = () => {
      // Clear with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#070814');
      gradient.addColorStop(1, '#0a0f1f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Move toward mouse gently
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          p.vx += (dx / dist) * 0.02;
          p.vy += (dy / dist) * 0.02;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw
        ctx.fillStyle = `rgba(91, 140, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.strokeStyle = `rgba(91, 140, 255, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.7;
    });

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mousePos]);

  return (
    <section className="relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full" />

      {/* Content */}
      <div className="relative z-10 min-h-[70vh] flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-space-grotesk leading-tight">
                  Market signals into{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    winning strategy
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted max-w-xl leading-relaxed">
                  Real market evidence compiled into actionable strategy reports in 30 minutes. Built for teams that want data-driven competitive advantage.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-3 bg-primary hover:bg-primary/90 text-foreground font-semibold rounded-lg transition-colors"
                >
                  Generate Report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-3 border border-primary/50 text-primary hover:bg-primary/10 font-semibold rounded-lg transition-colors"
                >
                  View Sample
                </motion.button>
              </div>

              {/* Trust Row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-wrap gap-4 pt-6 border-t border-border/30"
              >
                <div className="pt-4">
                  <div className="text-sm text-muted-foreground">Backed by real market signals</div>
                  <div className="text-accent font-semibold">5,000+ data points • 98% accuracy</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Strategy Report Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Report Card */}
              <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 shadow-2xl">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/30">
                    <h3 className="font-space-grotesk font-bold text-foreground text-lg">Strategy Report</h3>
                    <span className="text-xs font-mono text-accent">v3.2</span>
                  </div>

                  {/* Signal Cards */}
                  <div className="space-y-2">
                    {[
                      { icon: TrendingUp, label: 'SERP', value: 'Uptrend detected' },
                      { icon: Zap, label: 'Ads', value: '$2.4K avg spend' },
                      { icon: Target, label: 'Listings', value: '1,847 local' },
                    ].map((signal, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border/30"
                      >
                        <signal.icon className="w-4 h-4 text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono text-muted-foreground">{signal.label}</div>
                          <div className="text-sm font-semibold text-foreground truncate">{signal.value}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recommendation */}
                  <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                    <div className="text-xs font-mono text-accent/80 mb-1">Recommendation</div>
                    <p className="text-sm text-foreground font-semibold">Increase paid spend 40% on high-intent keywords</p>
                  </div>

                  {/* View Report Button */}
                  <button className="w-full mt-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary font-semibold rounded-lg transition-colors text-sm">
                    View Full Report →
                  </button>
                </div>
              </div>

              {/* Run Timeline Pill */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex items-center gap-2 text-xs text-muted-foreground bg-card/50 backdrop-blur border border-border/50 rounded-full px-4 py-2 w-fit"
              >
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span>Collecting</span>
                <span className="text-border/50">→</span>
                <span>Summarizing</span>
                <span className="text-border/50">→</span>
                <span className="text-accent font-semibold">Strategy Ready</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
