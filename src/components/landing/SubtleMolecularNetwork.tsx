"use client";

import React, { useEffect, useRef } from "react";

export default function SubtleMolecularNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Subtle small molecular nodes (6 to 8 nodes)
    const nodes = Array.from({ length: 8 }, (_, i) => ({
      x: (width / 9) * (i + 1) + (Math.random() - 0.5) * 40,
      y: (height / 2) + (Math.sin(i * 1.2) * 50) + (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: i % 2 === 0 ? 3.5 : 2.5,
      color: i % 3 === 0 ? "#FF243F" : "#94A3B8",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 15 || node.x > width - 15) node.vx *= -1;
        if (node.y < 15 || node.y > height - 15) node.vy *= -1;
      });

      // Draw faint interconnecting molecular bonds
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const bondAlpha = (1 - dist / 180) * 0.22;
            ctx.strokeStyle = `rgba(255, 36, 63, ${bondAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes with subtle glow
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        if (node.color === "#FF243F") {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 36, 63, 0.12)";
          ctx.fill();
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
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0"
      aria-hidden="true"
    />
  );
}
