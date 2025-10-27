'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'sparkle' | 'currency';
  rotation: number;
  rotationSpeed: number;
  color: string;
  currencySymbol: string;
}

interface AnimatedBackgroundProps {
  isDarkMode: boolean;
}

export default function AnimatedBackground({ isDarkMode }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Particle count based on screen size - optimized for performance
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 20000);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    // Create a single particle
    const createParticle = (): Particle => {
      const type: Particle['type'] = isDarkMode ? 'sparkle' : 'currency';

      // Dark mode colors (very bright, glowing)
      const darkColors = [
        '#a0ffc0', // Very bright green
        '#ffb870', // Bright orange
        '#70b5ff', // Bright blue
        '#b89fff', // Bright purple
        '#ffd040', // Bright yellow
        '#ff5eb0', // Bright pink
      ];

      // Light mode colors (very dark, highly visible)
      const lightColors = [
        '#1e3a8a', // Very dark blue
        '#065f46', // Very dark green
        '#b45309', // Very dark amber/orange
        '#5b21b6', // Very dark purple
        '#0c4a6e', // Very dark cyan
        '#9f1239', // Very dark pink/red
      ];

      // All currency symbols including crypto
      const currencySymbols = [
        '$', '€', '¥', '£', '₹', '₩', '₪', '₦', '₱', '₡', '₴', '₸', '₵', '₲',
        '₿', // Bitcoin
        'Ξ', // Ethereum
        '₳', // Cardano
        'Ð', // Dogecoin
        '₮', // Tether
        'Ł', // Litecoin
      ];
      const colors = isDarkMode ? darkColors : lightColors;

      // Reverse light speed - currencies fly from edges TOWARD center (viewing from behind)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Random angle from center
      const angle = Math.random() * Math.PI * 2;

      // Start at various distances from center for immediate visual impact
      const maxDistance = Math.max(canvas.width, canvas.height) * 0.6;
      // Distribute particles along the entire path (from edges to center)
      const distance = 50 + Math.random() * (maxDistance + 150);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Speed toward center (negative to move inward) - HIGH SPEED
      const speed = (isDarkMode ? 15 : 20) + Math.random() * 15; // 15-30 or 20-35 pixels per frame
      const speedX = -Math.cos(angle) * speed; // Negative = toward center
      const speedY = -Math.sin(angle) * speed; // Negative = toward center

      return {
        x,
        y,
        size: isDarkMode ? Math.random() * 2 + 0.5 : Math.random() * 2 + 1,
        speedX,
        speedY,
        opacity: 0.6, // Fixed opacity - no flickering
        type: 'currency', // Always currency now (no sparkles)
        rotation: angle + Math.PI, // Rotate 180° to face movement direction
        rotationSpeed: 0, // No rotation, just movement
        color: colors[Math.floor(Math.random() * colors.length)],
        currencySymbol: currencySymbols[Math.floor(Math.random() * currencySymbols.length)],
      };
    };

    // Draw sparkle (for dark mode)
    const drawSparkle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);

      // Create glow effect
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 3);
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw cross sparkle
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = particle.size * 0.5;
      ctx.globalAlpha = particle.opacity;

      ctx.beginPath();
      ctx.moveTo(-particle.size * 2, 0);
      ctx.lineTo(particle.size * 2, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -particle.size * 2);
      ctx.lineTo(0, particle.size * 2);
      ctx.stroke();

      ctx.restore();
    };

    // Draw currency symbol with perspective shrinking (optimized - no trails)
    const drawCurrency = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Calculate distance from center
      const dx = particle.x - centerX;
      const dy = particle.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = Math.max(canvas.width, canvas.height) * 0.6;

      // Calculate perspective scale (shrink as it gets closer to center/distance)
      const distanceRatio = distance / maxDistance;
      const scale = Math.max(0.2, distanceRatio);

      // Calculate opacity fade (fade out as it gets closer to center)
      const fadeOpacity = particle.opacity * Math.max(0.3, distanceRatio);

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);

      const fontSize = particle.size * 8 * scale;
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = fadeOpacity;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(particle.currencySymbol, 0, 0);

      ctx.restore();
    };

    // Update and draw particles
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      particlesRef.current.forEach((particle, index) => {
        // Update position - fly inward toward center
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Calculate distance from center
        const distanceFromCenter = Math.sqrt(
          Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2)
        );

        // Respawn at edges when particle reaches center (viewing from behind effect)
        if (distanceFromCenter < 50) {
          // Create new particle at edge flying inward
          particlesRef.current[index] = createParticle();
        }

        // Always draw currency (no sparkles anymore)
        drawCurrency(ctx, particle);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        opacity: isDarkMode ? 0.4 : 0.7,
      }}
    />
  );
}
