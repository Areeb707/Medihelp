"use client";
import React, { useEffect, useRef } from "react";

interface SparkleParticle {
  x: number;          // normalized 0-1
  y: number;          // normalized 0-1
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  driftX: number;
  driftY: number;
  color: string;
  isStar: boolean;    // 4-point star sparkle flare
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Generate 45 twinkling glitter sparkles across the background
    const colors = ["#2dd4bf", "#34d399", "#6ee7b7", "#a7f3d0", "#ffffff", "#e0ffff", "#7ffff0"];
    const sparkles: SparkleParticle[] = [];

    for (let i = 0; i < 45; i++) {
      sparkles.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.8 + Math.random() * 2.2,
        baseAlpha: 0.20 + Math.random() * 0.55,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.05,
        driftX: (Math.random() - 0.5) * 0.04,
        driftY: (Math.random() - 0.5) * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)],
        isStar: Math.random() > 0.65, // 35% of particles draw starburst sparkles
      });
    }

    let time = 0;

    // Helper to draw a 4-point glittering star flare
    const drawStarSparkle = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      color: string,
      alpha: number
    ) => {
      c.save();
      c.globalAlpha = alpha;
      c.strokeStyle = color;
      c.fillStyle = color;
      c.lineWidth = 1.2;
      c.shadowColor = color;
      c.shadowBlur = 8;

      // Vertical & Horizontal Spikes
      c.beginPath();
      c.moveTo(cx - r * 2.5, cy);
      c.lineTo(cx + r * 2.5, cy);
      c.moveTo(cx, cy - r * 2.5);
      c.lineTo(cx, cy + r * 2.5);
      c.stroke();

      // Center Core
      c.beginPath();
      c.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Render glittering sparkles
      sparkles.forEach((p) => {
        p.x += p.driftX * 0.001;
        p.y += p.driftY * 0.001;

        if (p.x > 1.0) p.x = 0;
        if (p.x < 0) p.x = 1.0;
        if (p.y > 1.0) p.y = 0;
        if (p.y < 0) p.y = 1.0;

        const px = p.x * width;
        const py = p.y * height;

        const alpha = p.baseAlpha + Math.sin(time * 3 + p.twinklePhase) * 0.35;
        const clampedAlpha = Math.max(0.05, Math.min(0.88, alpha));

        if (p.isStar && clampedAlpha > 0.30) {
          drawStarSparkle(ctx, px, py, p.size, p.color, clampedAlpha);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = clampedAlpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base Dark Canvas (#030710) */}
      <div className="absolute inset-0 bg-[#030710]" />

      {/* ── 1. PRIMARY GREEN AMBIENT LIGHT (Center-Right / Upper-Right) ── */}
      <div
        className="ambient-glow-1 absolute top-[-5%] right-[2%] w-[950px] h-[680px] pointer-events-none opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0, 212, 160, 0.38) 0%, rgba(0, 165, 128, 0.22) 40%, rgba(0, 90, 70, 0.08) 70%, transparent 95%)",
          filter: "blur(75px)",
        }}
      />

      {/* ── 2. SECONDARY AMBIENT GLOW (Lower / Right Atmospheric Fill) ── */}
      <div
        className="ambient-glow-2 absolute top-[30%] right-[10%] w-[800px] h-[550px] pointer-events-none opacity-85"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0, 180, 140, 0.28) 0%, rgba(0, 120, 95, 0.14) 48%, transparent 90%)",
          filter: "blur(85px)",
        }}
      />

      {/* ── 3. TERTIARY UPPER-RIGHT GLOW (Upper Atmospheric Bloom) ── */}
      <div
        className="ambient-glow-3 absolute top-[-10%] right-[-8%] w-[750px] h-[480px] pointer-events-none opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(24, 214, 197, 0.25) 0%, rgba(0, 160, 130, 0.12) 55%, transparent 90%)",
          filter: "blur(70px)",
        }}
      />

      {/* ── 4. SPARKLE & GLITTER CANVAS LAYER ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-90"
      />

      {/* ── 5. LEFT-SIDE DARK GRADIENT OVERLAY (Protects Text Contrast) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(to right, #030710 0%, rgba(3,7,16,0.75) 20%, transparent 42%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(3,7,16,0.15) 75%, #030710 100%)",
        }}
      />
    </div>
  );
}
