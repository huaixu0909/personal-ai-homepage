"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
};

const particleCount = 86;
const connectionDistance = 150;

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    size: Math.random() * 1.8 + 0.7,
    alpha: Math.random() * 0.55 + 0.25,
  };
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: particleCount }, () => createParticle(width, height));
    };

    const render = () => {
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(34, 211, 238, 0.95)");
      gradient.addColorStop(0.5, "rgba(163, 230, 53, 0.7)");
      gradient.addColorStop(1, "rgba(125, 211, 252, 0.85)");

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;

        context.beginPath();
        context.fillStyle = `rgba(165, 243, 252, ${particle.alpha})`;
        context.shadowColor = "rgba(34, 211, 238, 0.8)";
        context.shadowBlur = 10;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowBlur = 0;
      context.strokeStyle = gradient;

      for (let leftIndex = 0; leftIndex < particles.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < particles.length; rightIndex += 1) {
          const left = particles[leftIndex];
          const right = particles[rightIndex];
          const distance = Math.hypot(left.x - right.x, left.y - right.y);

          if (distance < connectionDistance) {
            context.globalAlpha = ((connectionDistance - distance) / connectionDistance) * 0.22;
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(left.x, left.y);
            context.lineTo(right.x, right.y);
            context.stroke();
          }
        }
      }

      context.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-70 mix-blend-screen"
    />
  );
}
