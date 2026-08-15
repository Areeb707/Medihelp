"use client";
import React, { useEffect, useRef } from "react";

interface Particle {
  rx: number; // reference x (0 to 1764)
  ry: number; // reference y (0 to 892)
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  driftX: number;
  driftY: number;
  color: string;
}

export default function AuroraField() {
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

    // 8-10 sparse suspended particles in right-side atmosphere
    const particles: Particle[] = [
      { rx: 1100, ry: 280, size: 1.4, baseAlpha: 0.35, twinklePhase: 0,   twinkleSpeed: 0.03, driftX: 0.10, driftY: -0.05, color: "#16CDBA" },
      { rx: 1320, ry: 220, size: 1.8, baseAlpha: 0.45, twinklePhase: 1.2, twinkleSpeed: 0.02, driftX: -0.08, driftY: 0.06, color: "#00BFA5" },
      { rx: 1410, ry: 310, size: 1.2, baseAlpha: 0.40, twinklePhase: 2.4, twinkleSpeed: 0.04, driftX: 0.06, driftY: 0.08, color: "#00A98F" },
      { rx: 1250, ry: 410, size: 1.6, baseAlpha: 0.30, twinklePhase: 3.6, twinkleSpeed: 0.025, driftX: -0.05, driftY: -0.06, color: "#16CDBA" },
      { rx: 1480, ry: 460, size: 1.5, baseAlpha: 0.35, twinklePhase: 4.8, twinkleSpeed: 0.035, driftX: 0.08, driftY: -0.04, color: "#00BFA5" },
      { rx: 1550, ry: 250, size: 1.3, baseAlpha: 0.25, twinklePhase: 0.8, twinkleSpeed: 0.02, driftX: -0.06, driftY: 0.05, color: "#008F78" },
      { rx: 1380, ry: 490, size: 1.7, baseAlpha: 0.40, twinklePhase: 2.0, twinkleSpeed: 0.03, driftX: 0.04, driftY: 0.07, color: "#16CDBA" },
      { rx: 1210, ry: 340, size: 1.1, baseAlpha: 0.30, twinklePhase: 4.0, twinkleSpeed: 0.025, driftX: -0.07, driftY: -0.03, color: "#00BFA5" },
    ];

    let time = 0;

    // Helper to map reference coordinates (1764 x 892) to responsive canvas pixels
    const mapPos = (rx: number, ry: number): [number, number] => {
      return [(rx / 1764) * width, (ry / 892) * height];
    };

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // ── 1. BASE DARK CANVAS (#03090D) ──
      ctx.fillStyle = "#03090D";
      ctx.fillRect(0, 0, width, height);

      // ── 2. LARGE IRREGULAR ATMOSPHERIC EMERALD FIELD (x ≈ 650 -> 1764, y ≈ 100 -> 600) ──
      const center1 = mapPos(1350 + Math.sin(time * 0.3) * 30, 300 + Math.cos(time * 0.25) * 20);
      const radius1 = Math.max(width, height) * 0.55;

      const mainAtmosphere = ctx.createRadialGradient(
        center1[0], center1[1], 0,
        center1[0], center1[1], radius1
      );
      mainAtmosphere.addColorStop(0, "rgba(0, 143, 120, 0.26)");
      mainAtmosphere.addColorStop(0.3, "rgba(0, 90, 72, 0.16)");
      mainAtmosphere.addColorStop(0.6, "rgba(0, 61, 50, 0.07)");
      mainAtmosphere.addColorStop(0.85, "rgba(3, 9, 13, 0.02)");
      mainAtmosphere.addColorStop(1, "rgba(3, 9, 13, 0)");

      ctx.fillStyle = mainAtmosphere;
      ctx.fillRect(0, 0, width, height);

      // ── 3. UPPER ATMOSPHERIC DIFFUSION (x ≈ 650–750, y ≈ 140–180 extending right) ──
      const upperCenter = mapPos(1150 + Math.cos(time * 0.35) * 25, 160 + Math.sin(time * 0.2) * 15);
      const upperRadius = Math.max(width, height) * 0.40;

      const upperAtmosphere = ctx.createRadialGradient(
        upperCenter[0], upperCenter[1], 0,
        upperCenter[0], upperCenter[1], upperRadius
      );
      upperAtmosphere.addColorStop(0, "rgba(0, 169, 143, 0.18)");
      upperAtmosphere.addColorStop(0.4, "rgba(0, 90, 72, 0.09)");
      upperAtmosphere.addColorStop(0.8, "rgba(3, 9, 13, 0)");

      ctx.fillStyle = upperAtmosphere;
      ctx.fillRect(0, 0, width, height);

      // ── 4. THIRD SUPPORTING SPECTRAL LAYER (Faint Background Layer for Depth) ──
      const supp0 = mapPos(1100, 320 + Math.sin(time * 0.2) * 10);
      const supp1 = mapPos(1350, 380 + Math.cos(time * 0.25) * 15);
      const supp2 = mapPos(1600, 350 + Math.sin(time * 0.3) * 12);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(supp0[0], supp0[1]);
      ctx.quadraticCurveTo(supp1[0], supp1[1], supp2[0], supp2[1]);

      const suppGrad = ctx.createLinearGradient(supp0[0], supp0[1], supp2[0], supp2[1]);
      suppGrad.addColorStop(0, "rgba(0, 61, 50, 0)");
      suppGrad.addColorStop(0.5, "rgba(0, 90, 72, 0.10)");
      suppGrad.addColorStop(1, "rgba(0, 61, 50, 0)");

      ctx.strokeStyle = suppGrad;
      ctx.lineWidth = 140;
      ctx.lineCap = "round";
      ctx.filter = "blur(60px)";
      ctx.stroke();
      ctx.restore();

      // ── 5. SECONDARY SPECTRAL STRUCTURE (Lower, Broader & Dimmer: x=950–1050, y=460–500 -> x=1600, y=450) ──
      const sec0 = mapPos(1000 + Math.sin(time * 0.22) * 15, 480 + Math.cos(time * 0.28) * 10);
      const sec1 = mapPos(1250, 450 + Math.sin(time * 0.32) * 12);
      const sec2 = mapPos(1620, 450 + Math.cos(time * 0.2) * 14);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sec0[0], sec0[1]);
      ctx.quadraticCurveTo(sec1[0], sec1[1], sec2[0], sec2[1]);

      const secHaloGrad = ctx.createLinearGradient(sec0[0], sec0[1], sec2[0], sec2[1]);
      secHaloGrad.addColorStop(0, "rgba(0, 90, 72, 0)");
      secHaloGrad.addColorStop(0.3, "rgba(0, 143, 120, 0.14)");
      secHaloGrad.addColorStop(0.7, "rgba(0, 90, 72, 0.10)");
      secHaloGrad.addColorStop(1, "rgba(0, 61, 50, 0)");

      ctx.strokeStyle = secHaloGrad;
      ctx.lineWidth = 160;
      ctx.lineCap = "round";
      ctx.filter = "blur(55px)";
      ctx.stroke();

      // Secondary inner soft ribbon
      ctx.strokeStyle = "rgba(0, 169, 143, 0.12)";
      ctx.lineWidth = 60;
      ctx.filter = "blur(28px)";
      ctx.stroke();
      ctx.restore();

      // ── 6. PRIMARY SPECTRAL STRUCTURE (EXACT PARAMETRIC TRAJECTORY & 4 SPECTRAL LEVELS) ──
      // Starts (1450, 175) -> descends left (1390, 230) -> BEND (1360-1400, 270-310) -> descends down (1280, 360) -> (1180, 430) -> sweeps right-down (1520, 515)
      const pStart  = mapPos(1450 + Math.sin(time * 0.2) * 10, 175 + Math.cos(time * 0.25) * 8);
      const pUpper  = mapPos(1400 + Math.cos(time * 0.28) * 12, 225 + Math.sin(time * 0.3) * 10);
      const pBend   = mapPos(1375 + Math.sin(time * 0.32) * 15, 290 + Math.cos(time * 0.22) * 12); // MAIN TURNING POINT
      const pDesc1  = mapPos(1280 + Math.cos(time * 0.25) * 14, 360 + Math.sin(time * 0.35) * 10);
      const pDesc2  = mapPos(1190 + Math.sin(time * 0.3) * 12, 430 + Math.cos(time * 0.2) * 12);
      const pEnd    = mapPos(1540 + Math.cos(time * 0.18) * 16, 515 + Math.sin(time * 0.25) * 14);

      // Construct continuous smooth path
      const drawPrimaryPath = (c: CanvasRenderingContext2D) => {
        c.beginPath();
        c.moveTo(pStart[0], pStart[1]);
        c.bezierCurveTo(pUpper[0], pUpper[1], pBend[0] + 20, pBend[1] - 20, pBend[0], pBend[1]);
        c.bezierCurveTo(pBend[0] - 30, pBend[1] + 30, pDesc1[0], pDesc1[1], pDesc2[0], pDesc2[1]);
        c.bezierCurveTo(pDesc2[0] + 50, pDesc2[1] + 30, pEnd[0] - 100, pEnd[1] - 20, pEnd[0], pEnd[1]);
      };

      // Gradient along primary path with peak intensity at main turning point (pBend)
      const primaryGrad = ctx.createLinearGradient(pStart[0], pStart[1], pEnd[0], pEnd[1]);
      primaryGrad.addColorStop(0, "rgba(0, 90, 72, 0.05)");        // START: faint
      primaryGrad.addColorStop(0.2, "rgba(0, 169, 143, 0.35)");     // approaching bend: medium
      primaryGrad.addColorStop(0.42, "rgba(22, 205, 186, 0.65)");    // BEND: BRIGHTEST EMERALD/TEAL
      primaryGrad.addColorStop(0.65, "rgba(0, 191, 165, 0.40)");    // descending: medium
      primaryGrad.addColorStop(0.85, "rgba(0, 143, 120, 0.20)");    // lower sweep: soft
      primaryGrad.addColorStop(1, "rgba(0, 61, 50, 0)");           // far lower-right: faint

      // LEVEL 1 — OUTER ATMOSPHERIC HALO (Very large, heavily blurred)
      ctx.save();
      drawPrimaryPath(ctx);
      ctx.strokeStyle = primaryGrad;
      ctx.lineWidth = 220;
      ctx.lineCap = "round";
      ctx.filter = "blur(70px)";
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      ctx.restore();

      // LEVEL 2 — MEDIUM DIFFUSE RIBBON (Translucent green following curve)
      ctx.save();
      drawPrimaryPath(ctx);
      ctx.strokeStyle = primaryGrad;
      ctx.lineWidth = 90;
      ctx.lineCap = "round";
      ctx.filter = "blur(36px)";
      ctx.stroke();
      ctx.restore();

      // LEVEL 3 — BRIGHTER FLOWING REGION (More visible around main bend)
      ctx.save();
      drawPrimaryPath(ctx);
      const level3Grad = ctx.createLinearGradient(pStart[0], pStart[1], pEnd[0], pEnd[1]);
      level3Grad.addColorStop(0, "rgba(0, 143, 120, 0)");
      level3Grad.addColorStop(0.25, "rgba(0, 191, 165, 0.45)");
      level3Grad.addColorStop(0.42, "rgba(22, 205, 186, 0.75)"); // Peak at bend
      level3Grad.addColorStop(0.65, "rgba(0, 169, 143, 0.40)");
      level3Grad.addColorStop(1, "rgba(0, 90, 72, 0)");
      ctx.strokeStyle = level3Grad;
      ctx.lineWidth = 32;
      ctx.lineCap = "round";
      ctx.filter = "blur(16px)";
      ctx.stroke();
      ctx.restore();

      // LEVEL 4 — SUBTLE LUMINOUS EDGE (Very narrow, low opacity cyan-green, NO bright white/laser!)
      ctx.save();
      drawPrimaryPath(ctx);
      const level4Grad = ctx.createLinearGradient(pStart[0], pStart[1], pEnd[0], pEnd[1]);
      level4Grad.addColorStop(0.1, "rgba(22, 205, 186, 0)");
      level4Grad.addColorStop(0.3, "rgba(22, 205, 186, 0.35)");
      level4Grad.addColorStop(0.42, "rgba(180, 255, 240, 0.55)"); // Soft subtle cyan highlight at bend
      level4Grad.addColorStop(0.60, "rgba(22, 205, 186, 0.30)");
      level4Grad.addColorStop(0.9, "rgba(0, 191, 165, 0)");
      ctx.strokeStyle = level4Grad;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.filter = "blur(6px)";
      ctx.stroke();
      ctx.restore();

      // ── 7. SOFT EMERALD BLOOM AROUND BEND (x ≈ 1350–1400, y ≈ 270–300) ──
      const bendBloomPos = mapPos(1375 + Math.sin(time * 0.32) * 15, 290 + Math.cos(time * 0.22) * 12);
      const bendBloomRad = Math.max(width, height) * 0.18;
      const bendBloom = ctx.createRadialGradient(
        bendBloomPos[0], bendBloomPos[1], 0,
        bendBloomPos[0], bendBloomPos[1], bendBloomRad
      );
      bendBloom.addColorStop(0, "rgba(22, 205, 186, 0.22)");
      bendBloom.addColorStop(0.5, "rgba(0, 169, 143, 0.08)");
      bendBloom.addColorStop(1, "rgba(3, 9, 13, 0)");
      ctx.fillStyle = bendBloom;
      ctx.fillRect(0, 0, width, height);

      // ── 8. PARTICLES (8-10 Sparse Particles Suspended in Right-Side Atmosphere) ──
      ctx.save();
      particles.forEach((p) => {
        // Slow subtle drift
        p.rx += p.driftX;
        p.ry += p.driftY;
        if (p.rx > 1700) p.rx = 1050;
        if (p.rx < 1050) p.rx = 1700;
        if (p.ry > 600) p.ry = 180;
        if (p.ry < 180) p.ry = 600;

        const pos = mapPos(p.rx, p.ry);
        const alpha = p.baseAlpha + Math.sin(time * 3 + p.twinklePhase) * 0.20;
        const clampedAlpha = Math.max(0.05, Math.min(0.65, alpha));

        ctx.beginPath();
        ctx.arc(pos[0], pos[1], p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = clampedAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
      });
      ctx.restore();

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
      {/* Base Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Dark Left Side (38%) Overlay & Soft Vignette for Text Contrast */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "linear-gradient(to right, #03090D 0%, rgba(3,9,13,0.85) 32%, rgba(3,9,13,0.40) 52%, transparent 72%)"
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(3,9,13,0.15) 60%, #03090D 100%)"
        }}
      />
    </div>
  );
}
