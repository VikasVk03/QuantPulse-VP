import React, { useEffect, useRef } from "react";

interface CityNode {
  name: string;
  lat: number;
  lng: number;
  ping: string;
  color: string;
}

const CITIES: CityNode[] = [
  {
    name: "LONDON",
    lat: 51.5074,
    lng: -0.1278,
    ping: "12ms",
    color: "#38bdf8",
  },
  {
    name: "NEW YORK",
    lat: 40.7128,
    lng: -74.006,
    ping: "18ms",
    color: "#60a5fa",
  },
  { name: "MUMBAI", lat: 19.076, lng: 72.8777, ping: "4ms", color: "#34d399" },
  {
    name: "SINGAPORE",
    lat: 1.3521,
    lng: 103.8198,
    ping: "8ms",
    color: "#a78bfa",
  },
  {
    name: "TOKYO",
    lat: 35.6762,
    lng: 139.6503,
    ping: "22ms",
    color: "#f472b6",
  },
];

export function InteractiveGlobe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    // Generate random background stars
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * 260,
      y: Math.random() * 260,
      radius: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 88;

      rotation += 0.008;

      // Draw faint stars
      stars.forEach((star) => {
        star.alpha += star.pulseSpeed;
        if (star.alpha > 0.9 || star.alpha < 0.2)
          star.pulseSpeed = -star.pulseSpeed;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${Math.max(0, star.alpha)})`;
        ctx.fill();
      });

      // Outer atmospheric glow
      const outerGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.7,
        centerX,
        centerY,
        radius * 1.25,
      );
      outerGlow.addColorStop(0, "rgba(59, 130, 246, 0.08)");
      outerGlow.addColorStop(0.6, "rgba(56, 189, 248, 0.12)");
      outerGlow.addColorStop(1, "rgba(147, 51, 234, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Globe base sphere
      const sphereGradient = ctx.createRadialGradient(
        centerX - radius * 0.35,
        centerY - radius * 0.35,
        radius * 0.1,
        centerX,
        centerY,
        radius,
      );
      sphereGradient.addColorStop(0, "rgba(14, 45, 92, 0.75)");
      sphereGradient.addColorStop(0.6, "rgba(8, 22, 50, 0.92)");
      sphereGradient.addColorStop(1, "rgba(3, 9, 24, 0.98)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGradient;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.stroke();

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const rad = (lat * Math.PI) / 180;
        const y = centerY + Math.sin(rad) * radius * 0.9;
        const rLat = Math.cos(rad) * radius * 0.95;

        ctx.beginPath();
        ctx.ellipse(centerX, y, rLat, rLat * 0.32, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.18)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Longitude lines
      for (let i = 0; i < 8; i++) {
        const lonAngle = rotation + (i * Math.PI) / 4;
        const rx = Math.sin(lonAngle) * radius * 0.95;

        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(rx),
          radius * 0.95,
          0,
          0,
          Math.PI * 2,
        );
        ctx.strokeStyle =
          Math.cos(lonAngle) > 0
            ? "rgba(96, 165, 250, 0.28)"
            : "rgba(59, 130, 246, 0.08)";
        ctx.lineWidth = Math.cos(lonAngle) > 0 ? 0.9 : 0.4;
        ctx.stroke();
      }

      // Orbital outer ring (glowing tilted halo)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.35);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.32, radius * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.35)";
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // City coordinates & network lines
      const projectedCities: {
        x: number;
        y: number;
        city: CityNode;
        visible: boolean;
      }[] = [];

      CITIES.forEach((city) => {
        const latRad = (city.lat * Math.PI) / 180;
        const lngRad = (city.lng * Math.PI) / 180 + rotation;

        const x = centerX + radius * Math.cos(latRad) * Math.sin(lngRad) * 0.92;
        const y = centerY - radius * Math.sin(latRad) * 0.92;
        const visible = Math.cos(lngRad) > -0.2;

        projectedCities.push({ x, y, city, visible });
      });

      // Connecting data beams / arcs
      for (let i = 0; i < projectedCities.length; i++) {
        for (let j = i + 1; j < projectedCities.length; j++) {
          const p1 = projectedCities[i];
          const p2 = projectedCities[j];

          if (p1.visible && p2.visible) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 - 14;
            ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
            ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Render city nodes and labels
      projectedCities.forEach(({ x, y, city, visible }) => {
        if (!visible) return;

        // Glowing pulsing outer ring
        const pulse = Math.sin(Date.now() * 0.005 + city.lat) * 2 + 5;
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(52, 211, 153, 0.25)";
        ctx.fill();

        // City core node
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#34d399";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.font = "bold 9px 'Geist Variable', ui-sans-serif, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 4;
        ctx.fillText(city.name, x + 6, y - 2);
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={260}
        height={260}
        className="w-full max-w-[260px] h-auto drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]"
      />
    </div>
  );
}
