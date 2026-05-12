'use client';

import { useEffect, useRef, useState } from 'react';

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isVisibleRef = useRef(true);
  const isInViewportRef = useRef(true);

  // Intersection Observer to pause when out of viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewportRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Visibility detection (pause when tab hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Cursor tracking for desktop
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  // Starfield canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    setCanvasSize();

    // Star particle
    interface Star {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      opacity: number;
      vx: number;
      vy: number;
      twinkleCycle: number;
    }

    // Create particles with lower count for connection effect
    const particleCount = 40;
    
    const stars: Star[] = Array.from({ length: particleCount }, () => {
      const x = Math.random() * (canvas.width / window.devicePixelRatio);
      const y = Math.random() * (canvas.height / window.devicePixelRatio);
      return {
        x,
        baseX: x,
        y,
        baseY: y,
        size: Math.random() * 1.8 + 0.8,
        opacity: Math.random() * 0.3 + 0.6,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        twinkleCycle: Math.random() * Math.PI * 2,
      };
    });

    let animationFrameId: number;
    let lastTime = Date.now();
    const connectionDistance = 200;

    const animate = () => {
      // Skip animation if tab is hidden or component is out of viewport
      if (!isVisibleRef.current || !isInViewportRef.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      const isDark = document.documentElement.classList.contains('dark');

      // Slightly distinct from --background so the hero section has its own feel
      ctx.fillStyle = isDark ? '#0A0D1F' : '#EDEAF6';
      ctx.fillRect(0, 0, w, h);

      const now = Date.now();
      lastTime = now;

      // Update particle positions
      stars.forEach((star) => {
        if (prefersReducedMotion) {
          star.x = star.baseX;
          star.y = star.baseY;
        } else {
          const offsetX = (mousePos.x / window.innerWidth - 0.5) * 40;
          const offsetY = (mousePos.y / window.innerHeight - 0.5) * 40;
          star.x = star.baseX + offsetX;
          star.y = star.baseY + offsetY;
        }

        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;

        star.twinkleCycle += 0.03;
        const twinkleAmount = Math.sin(star.twinkleCycle) * 0.2;
        star.opacity = Math.max(0.4, Math.min(1.0, 0.7 + twinkleAmount));
      });

      // Draw gradient connections
      stars.forEach((star, idx) => {
        for (let i = idx + 1; i < stars.length; i++) {
          const otherStar = stars[i];
          const dx = star.x - otherStar.x;
          const dy = star.y - otherStar.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            // Quadratic falloff keeps distant lines more visible than linear
            const t = 1 - distance / connectionDistance;
            const opacity = (t * t + t) / 2 * 0.9;
            const gradient = ctx.createLinearGradient(star.x, star.y, otherStar.x, otherStar.y);

            if (isDark) {
              gradient.addColorStop(0, `rgba(91, 140, 255, ${opacity})`);
              gradient.addColorStop(0.5, `rgba(53, 211, 163, ${opacity * 0.85})`);
              gradient.addColorStop(1, `rgba(91, 140, 255, ${opacity})`);
            } else {
              gradient.addColorStop(0, `rgba(80, 70, 130, ${opacity})`);
              gradient.addColorStop(0.5, `rgba(100, 90, 160, ${opacity * 0.85})`);
              gradient.addColorStop(1, `rgba(80, 70, 130, ${opacity})`);
            }

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(otherStar.x, otherStar.y);
            ctx.stroke();
          }
        }
      });

      // Draw particles
      stars.forEach((star) => {
        const starColor = isDark
          ? `rgba(238, 243, 255, ${star.opacity})`
          : `rgba(50, 56, 65, ${star.opacity})`;
        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      setCanvasSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePos, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
