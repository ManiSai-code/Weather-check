import { useEffect, useRef } from 'react';

interface OverlayProps {
  condition: string;
}

export default function MapWeatherOverlay({ condition }: OverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const normalized = condition.toLowerCase();

  const isSandstorm = normalized.includes('sand') || normalized.includes('dust');
  const isStorm = (normalized.includes('thunder') || normalized.includes('storm') || normalized.includes('lightning')) && !isSandstorm;
  const isRain = normalized.includes('rain') || normalized.includes('drizzle') || normalized.includes('shower') || normalized.includes('patchy');
  const isSnow = normalized.includes('snow') || normalized.includes('blizzard') || normalized.includes('sleet');
  const isCloudy = normalized.includes('cloud') || normalized.includes('overcast') || normalized.includes('mist') || normalized.includes('fog') || normalized.includes('haze');
  const isSunny = normalized.includes('sun') || normalized.includes('clear');

  useEffect(() => {
    if (!canvasRef.current || (!isRain && !isSnow && !isStorm && !isSandstorm)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{ x: number; y: number; speed: number; length?: number; radius?: number; dx?: number }> = [];
    const maxParticles = isStorm || isSandstorm ? 80 : 50;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: isRain || isStorm ? Math.random() * 4 + 6 : (isSandstorm ? Math.random() * 5 + 6 : Math.random() * 1 + 0.8),
        length: isRain || isStorm ? Math.random() * 10 + 10 : undefined,
        radius: isSnow ? Math.random() * 3 + 1.5 : (isSandstorm ? Math.random() * 2 + 1 : undefined),
        dx: isSandstorm ? Math.random() * 4 + 4 : (isSnow ? Math.random() * 1 - 0.5 : undefined),
      });
    }

    // HELPER METHOD: Generates an unpredictable zigzag path for lightning bolts
    // REFACTORED: Double-pass neon contrast engine for maximum visibility
    const drawLightningBolt = (context: CanvasRenderingContext2D, startX: number, startY: number) => {
      let currentX = startX;
      let currentY = startY;
      
      // Store the path coordinates so we can trace it twice perfectly
      const pathPoints: Array<{ x: number; y: number }> = [{ x: currentX, y: currentY }];

      while (currentY < canvas.height) {
        const stepX = (Math.random() - 0.5) * 24; 
        const stepY = Math.random() * 15 + 12;   

        currentX += stepX;
        currentY += stepY;
        pathPoints.push({ x: currentX, y: currentY });
      }

      // PASS 1: Thick, Blazing Neon Aura Background Stroke
      context.strokeStyle = '#c084fc'; // Vibrant Purple-400
      context.lineWidth = 6;            // Much thicker line width for visibility
      context.shadowBlur = 20;          // Huge radiant glow radius
      context.shadowColor = '#a855f7';  // Solid Deep Purple Glow
      
      context.beginPath();
      context.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let i = 1; i < pathPoints.length; i++) {
        context.lineTo(pathPoints[i].x, pathPoints[i].y);
      }
      context.stroke();

      // PASS 2: Crisp, Pure White Core Foreground Stroke (The intense electrical center)
      context.strokeStyle = '#ffffff'; // Pure Hot White
      context.lineWidth = 2.5;          // Sits directly inside the thick purple lane
      context.shadowBlur = 4;           // Tight, bright internal glow
      context.shadowColor = '#ffffff';
      
      context.beginPath();
      context.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let i = 1; i < pathPoints.length; i++) {
        context.lineTo(pathPoints[i].x, pathPoints[i].y);
      }
      context.stroke();
    };

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let lightningTriggered = false;

      // Random lightning bolt generator (roughly 3% chance per frame during storms)
      if (isStorm && Math.random() > 0.97) {
        lightningTriggered = true;
        // 1. Ambient atmosphere flash
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)'; // Purple flash tint
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. Draw the physical jagged lightning strike line
        const randomStartX = Math.random() * (canvas.width - 60) + 30;
        drawLightningBolt(ctx, randomStartX, 0);
      }

      // Reset standard shadows for regular weather particles if lightning isn't active
      if (!lightningTriggered) {
        ctx.shadowBlur = isStorm ? 8 : (isSandstorm ? 2 : 4);
        ctx.shadowColor = isRain || isStorm ? '#60a5fa' : (isSandstorm ? '#d97706' : '#f1f5f9');
      }

      particles.forEach((p) => {
        if (isRain || isStorm) {
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = isStorm ? 2.5 : 1.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + (p.length || 8));
          ctx.stroke();

          p.y += p.speed;
          if (p.y > canvas.height) p.y = -15;
        } else if (isSandstorm) {
          ctx.fillStyle = 'rgba(217, 119, 6, 0.8)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius || 2, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.dx || 5;
          p.y += Math.sin(p.x * 0.05) * 0.5;

          if (p.x > canvas.width) {
            p.x = -10;
            p.y = Math.random() * canvas.height;
          }
        } else if (isSnow) {
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius || 2, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speed;
          p.x += p.dx || 0;
          if (p.y > canvas.height) p.y = -5;
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;
        }
      });

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animationId);
  }, [isRain, isSnow, isStorm, isSandstorm]);

  return (
    <div className="absolute inset-0 pointer-events-none w-[180px] h-[180px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full overflow-hidden">
      
      {isSunny && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-32 h-32 bg-amber-400/40 rounded-full blur-lg animate-pulse" />
          <div className="absolute w-24 h-24 bg-amber-300 rounded-full animate-ping opacity-60 blur-md" />
        </div>
      )}

      {/* 2. HIGH-CONTRAST CLOUDY / HAZE EFFECT (Heavy Layered Silhouette) */}
      {isCloudy && (
        <div className="absolute inset-0 flex items-center justify-center scale-110 select-none pointer-events-none">
          {/* Ambient Dark Threatening Cloud Base Silhouette */}
          <div className="absolute w-24 h-14 bg-slate-900/90 border border-slate-800/80 rounded-full filter blur-[1px] translate-y-1 -translate-x-1 shadow-md" />
          <div className="absolute w-20 h-12 bg-slate-800/95 border border-slate-700/60 rounded-full filter blur-[1px] -translate-y-1 translate-x-4 shadow-lg" />
          
          {/* High-Contrast Silver-Lining Foreground Highlights to pop off the map */}
          <div className="absolute w-16 h-8 bg-slate-200/90 rounded-full filter blur-[0.5px] -translate-y-3 -translate-x-2" />
          <div className="absolute w-12 h-6 bg-white/95 rounded-full filter blur-[0.5px] -translate-y-4 translate-x-2" />
        </div>
      )}

      {(isRain || isSnow || isStorm || isSandstorm) && (
        <canvas
          ref={canvasRef}
          width={180}
          height={180}
          className="w-full h-full bg-slate-950/50 backdrop-blur-[2px] border-2 border-slate-700 rounded-full shadow-[inset_0_0_15px_rgba(0,0,0,0.7)]"
        />
      )}
    </div>
  );
}