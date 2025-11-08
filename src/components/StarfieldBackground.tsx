import { useEffect, useRef } from "react";

const StarfieldBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create multiple layers of stars for parallax depth
    const createStarLayer = (count: number, sizeRange: [number, number], opacityRange: [number, number], speedMultiplier: number) => {
      const stars = [];
      for (let i = 0; i < count; i++) {
        const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
        const colorRand = Math.random();
        let color = "255, 255, 255";
        
        // Add variety of star colors
        if (colorRand > 0.97) {
          color = "180, 200, 255"; // Blue giants
        } else if (colorRand > 0.94) {
          color = "255, 220, 180"; // Orange/Red giants
        } else if (colorRand > 0.90) {
          color = "240, 240, 255"; // White-blue
        }

        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: size,
          opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
          twinkleSpeed: (Math.random() * 0.015 + 0.005) * speedMultiplier,
          twinklePhase: Math.random() * Math.PI * 2,
          color: color,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
      return stars;
    };

    // Create three layers for depth
    const distantStars = createStarLayer(150, [0.3, 0.8], [0.3, 0.6], 0.5);
    const midStars = createStarLayer(100, [0.8, 1.5], [0.5, 0.8], 1);
    const closeStars = createStarLayer(50, [1.5, 3], [0.7, 1], 1.5);

    // Create nebula effect particles
    const nebulae: Array<{
      x: number;
      y: number;
      radius: number;
      opacity: number;
      color: string;
      pulseSpeed: number;
      pulsePhase: number;
    }> = [];

    for (let i = 0; i < 8; i++) {
      const colors = [
        "100, 50, 150", // Purple
        "50, 100, 200", // Blue
        "150, 50, 100", // Magenta
        "80, 120, 180"  // Cyan-blue
      ];
      
      nebulae.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 200 + 150,
        opacity: Math.random() * 0.15 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: Math.random() * 0.01 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Create constellation lines (connecting bright stars)
    const constellations: Array<{
      star1: typeof closeStars[0];
      star2: typeof closeStars[0];
    }> = [];

    // Connect some random close stars
    for (let i = 0; i < 8; i++) {
      const star1 = closeStars[Math.floor(Math.random() * closeStars.length)];
      const star2 = closeStars[Math.floor(Math.random() * closeStars.length)];
      if (star1 !== star2) {
        const distance = Math.sqrt(
          Math.pow(star1.x - star2.x, 2) + Math.pow(star1.y - star2.y, 2)
        );
        // Only connect stars that are reasonably close
        if (distance < canvas.width * 0.3) {
          constellations.push({ star1, star2 });
        }
      }
    }

    // Animation loop
    let animationFrameId: number;
    let time = 0;

    const drawStar = (star: typeof closeStars[0], time: number) => {
      // Twinkle effect
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
      const pulse = (Math.sin(time * 0.001 + star.pulseOffset) + 1) / 2;
      const currentOpacity = star.opacity * (0.6 + twinkle * 0.4) * (0.9 + pulse * 0.1);

      // Draw star core
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${star.color}, ${currentOpacity})`;
      ctx.fill();

      // Add glow for larger stars
      if (star.size > 1) {
        const glowSize = star.size * (3 + pulse * 2);
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, glowSize
        );
        gradient.addColorStop(0, `rgba(${star.color}, ${currentOpacity * 0.4})`);
        gradient.addColorStop(0.5, `rgba(${star.color}, ${currentOpacity * 0.1})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add cross flare for brightest stars
      if (star.size > 2 && twinkle > 0.7) {
        ctx.strokeStyle = `rgba(${star.color}, ${currentOpacity * 0.3})`;
        ctx.lineWidth = 0.5;
        const flareLength = star.size * 8;
        
        ctx.beginPath();
        ctx.moveTo(star.x - flareLength, star.y);
        ctx.lineTo(star.x + flareLength, star.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(star.x, star.y - flareLength);
        ctx.lineTo(star.x, star.y + flareLength);
        ctx.stroke();
      }
    };

    const animate = () => {
      time += 16; // ~60fps

      // Clear with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#0a0a14");
      bgGradient.addColorStop(0.5, "#000000");
      bgGradient.addColorStop(1, "#0a0a0f");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulae
      nebulae.forEach((nebula) => {
        nebula.pulsePhase += nebula.pulseSpeed;
        const pulse = (Math.sin(nebula.pulsePhase) + 1) / 2;
        const currentOpacity = nebula.opacity * (0.7 + pulse * 0.3);

        const gradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0,
          nebula.x, nebula.y, nebula.radius
        );
        gradient.addColorStop(0, `rgba(${nebula.color}, ${currentOpacity})`);
        gradient.addColorStop(0.5, `rgba(${nebula.color}, ${currentOpacity * 0.3})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw constellation lines
      ctx.strokeStyle = "rgba(100, 150, 200, 0.15)";
      ctx.lineWidth = 1;
      constellations.forEach(({ star1, star2 }) => {
        ctx.beginPath();
        ctx.moveTo(star1.x, star1.y);
        ctx.lineTo(star2.x, star2.y);
        ctx.stroke();
      });

      // Draw star layers (back to front)
      distantStars.forEach(star => drawStar(star, time));
      midStars.forEach(star => drawStar(star, time));
      closeStars.forEach(star => drawStar(star, time));

      // Add subtle milky way effect
      const milkyWayGradient = ctx.createLinearGradient(
        canvas.width * 0.3, 0,
        canvas.width * 0.7, canvas.height
      );
      milkyWayGradient.addColorStop(0, "rgba(150, 150, 180, 0)");
      milkyWayGradient.addColorStop(0.3, "rgba(150, 150, 180, 0.03)");
      milkyWayGradient.addColorStop(0.5, "rgba(180, 180, 200, 0.05)");
      milkyWayGradient.addColorStop(0.7, "rgba(150, 150, 180, 0.03)");
      milkyWayGradient.addColorStop(1, "rgba(150, 150, 180, 0)");
      
      ctx.fillStyle = milkyWayGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: "linear-gradient(180deg, #0a0a14 0%, #000000 50%, #0a0a0f 100%)" 
      }}
    />
  );
};

export default StarfieldBackground;