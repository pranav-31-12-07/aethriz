"use client";

import React, { useEffect, useRef } from "react";

export default function RedDnaHelixVisual({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // DNA Parameters
    const numPairs = 32;
    const radius = 64; // Horizontal radius of the double helix
    let angle = 0;
    const speed = 0.0075; // Smooth, slow rotation
    const pitch = 2.4 * Math.PI; // Full helical turns across height

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!document.hidden) {
        angle += speed;

        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const startY = 30;
        const endY = height - 30;
        const stepY = (endY - startY) / (numPairs - 1);

        // Compute 3D points for both strands
        interface DnaPoint {
          y: number;
          x1: number;
          z1: number;
          x2: number;
          z2: number;
          midZ: number;
          rungColor: string;
        }

        const pairs: DnaPoint[] = [];

        for (let i = 0; i < numPairs; i++) {
          const t = i / (numPairs - 1);
          const y = startY + i * stepY;
          const theta = angle + t * pitch * 2;

          // Strand 1
          const x1 = centerX + Math.cos(theta) * radius;
          const z1 = Math.sin(theta); // -1 (back) to +1 (front)

          // Strand 2 (180 degrees offset)
          const x2 = centerX + Math.cos(theta + Math.PI) * radius;
          const z2 = Math.sin(theta + Math.PI);

          const midZ = (z1 + z2) / 2;

          // Subtle variety in base pair hydrogen bonding
          const rungColor = i % 2 === 0 ? "rgba(255, 36, 63, " : "rgba(220, 38, 38, ";

          pairs.push({ y, x1, z1, x2, z2, midZ, rungColor });
        }

        // Sort items for depth layering
        interface RenderItem {
          type: "rung" | "node1" | "node2";
          z: number;
          index: number;
        }

        const items: RenderItem[] = [];
        pairs.forEach((p, idx) => {
          items.push({ type: "rung", z: p.midZ, index: idx });
          items.push({ type: "node1", z: p.z1, index: idx });
          items.push({ type: "node2", z: p.z2, index: idx });
        });

        // Draw from back to front
        items.sort((a, b) => a.z - b.z);

        // Soft ambient red radial glow in the center
        const glowGrad = ctx.createRadialGradient(centerX, height / 2, 10, centerX, height / 2, radius * 2.2);
        glowGrad.addColorStop(0, "rgba(255, 36, 63, 0.08)");
        glowGrad.addColorStop(0.6, "rgba(255, 36, 63, 0.02)");
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, width, height);

        items.forEach((item) => {
          const p = pairs[item.index];

          if (item.type === "rung") {
            // Draw connecting base pair rung
            const depthAlpha = 0.25 + 0.45 * ((p.midZ + 1) / 2);
            ctx.beginPath();
            ctx.moveTo(p.x1, p.y);
            ctx.lineTo(p.x2, p.y);
            ctx.strokeStyle = `${p.rungColor}${depthAlpha.toFixed(2)})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();

            // Central hydrogen bond dot
            const midX = (p.x1 + p.x2) / 2;
            ctx.beginPath();
            ctx.arc(midX, p.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha.toFixed(2)})`;
            ctx.fill();
          } else if (item.type === "node1") {
            // Strand 1 nucleotide sphere
            const zNorm = (p.z1 + 1) / 2; // 0 (far) to 1 (near)
            const nodeRadius = 2.8 + zNorm * 2.6;
            const alpha = 0.35 + zNorm * 0.65;

            // Halo for foreground nodes
            if (zNorm > 0.6) {
              ctx.beginPath();
              ctx.arc(p.x1, p.y, nodeRadius * 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 36, 63, ${(0.18 * zNorm).toFixed(2)})`;
              ctx.fill();
            }

            // Node sphere with gradient
            const nodeGrad = ctx.createRadialGradient(
              p.x1 - nodeRadius * 0.3,
              p.y - nodeRadius * 0.3,
              0.5,
              p.x1,
              p.y,
              nodeRadius
            );
            nodeGrad.addColorStop(0, "#FFFFFF");
            nodeGrad.addColorStop(0.35, "#FF243F");
            nodeGrad.addColorStop(1, "#A10E20");

            ctx.beginPath();
            ctx.arc(p.x1, p.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = nodeGrad;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
          } else if (item.type === "node2") {
            // Strand 2 nucleotide sphere
            const zNorm = (p.z2 + 1) / 2; // 0 (far) to 1 (near)
            const nodeRadius = 2.8 + zNorm * 2.6;
            const alpha = 0.35 + zNorm * 0.65;

            if (zNorm > 0.6) {
              ctx.beginPath();
              ctx.arc(p.x2, p.y, nodeRadius * 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 36, 63, ${(0.18 * zNorm).toFixed(2)})`;
              ctx.fill();
            }

            const nodeGrad = ctx.createRadialGradient(
              p.x2 - nodeRadius * 0.3,
              p.y - nodeRadius * 0.3,
              0.5,
              p.x2,
              p.y,
              nodeRadius
            );
            nodeGrad.addColorStop(0, "#FFFFFF");
            nodeGrad.addColorStop(0.35, "#FF243F");
            nodeGrad.addColorStop(1, "#A10E20");

            ctx.beginPath();
            ctx.arc(p.x2, p.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = nodeGrad;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={`relative w-full h-[460px] sm:h-[520px] flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
        aria-label="3D Red Rotating DNA Double Helix"
      />
      
      {/* Subtle scientific coordinate watermark */}
      <div className="absolute right-4 bottom-4 font-mono text-[9px] text-slate-400 tracking-wider select-none pointer-events-none">
        DNA-B &bull; 34Å PITCH &bull; 10.5 BP/TURN
      </div>
    </div>
  );
}
