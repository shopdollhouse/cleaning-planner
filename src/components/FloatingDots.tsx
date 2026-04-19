import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  speedX: number;
  speedY: number;
  opacitySpeed: number;
}

// 7 pastel colors for floating background dots
const DOT_COLORS = [
  "rgba(234, 193, 200, ",  // Light Pink hsl(350 45% 75%)
  "rgba(206, 217, 243, ",  // Periwinkle hsl(210 50% 75%)
  "rgba(223, 198, 228, ",  // Lavender hsl(270 35% 75%)
  "rgba(191, 221, 218, ",  // Mint Cyan hsl(165 40% 75%)
  "rgba(242, 228, 179, ",  // Pale Cream hsl(45 60% 75%)
  "rgba(229, 193, 211, ",  // Dusty Rose hsl(340 35% 75%)
  "rgba(214, 224, 204, ",  // Sage Green hsl(160 60% 75%)
];

export function FloatingDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef   = useRef<Dot[]>([]);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    dotsRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 4 + Math.random() * 10,
      color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
      opacity: 0.10 + Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.32,
      speedY: -0.08 - Math.random() * 0.22,
      opacitySpeed: (Math.random() - 0.5) * 0.003,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dotsRef.current.forEach((dot) => {
        dot.x += dot.speedX;
        dot.y += dot.speedY;
        dot.opacity += dot.opacitySpeed;
        if (dot.opacity <= 0.08) dot.opacitySpeed =  Math.abs(dot.opacitySpeed);
        if (dot.opacity >= 0.52) dot.opacitySpeed = -Math.abs(dot.opacitySpeed);
        if (dot.y < -dot.radius * 2)              { dot.y = canvas.height + dot.radius; dot.x = Math.random() * canvas.width; }
        if (dot.x < -dot.radius * 2)                dot.x = canvas.width + dot.radius;
        if (dot.x > canvas.width + dot.radius * 2)  dot.x = -dot.radius;

        const g = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.radius);
        g.addColorStop(0,   `${dot.color}${dot.opacity})`);
        g.addColorStop(0.6, `${dot.color}${dot.opacity * 0.45})`);
        g.addColorStop(1,   `${dot.color}0)`);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
    />
  );
}
