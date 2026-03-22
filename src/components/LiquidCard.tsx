import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface LiquidCardProps {
  children: React.ReactNode;
  className?: string;
  aspectRatio?: string;
}

export default function LiquidCard({ children, className = '', aspectRatio = 'aspect-[4/3]' }: LiquidCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position relative to card center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for liquid effect
  const springConfig = { stiffness: 150, damping: 15 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform mouse position to distortion values
  const distortTop = useTransform(smoothY, [-150, 0, 150], [15, 0, -15]);
  const distortBottom = useTransform(smoothY, [-150, 0, 150], [-15, 0, 15]);
  const distortLeft = useTransform(smoothX, [-150, 0, 150], [15, 0, -15]);
  const distortRight = useTransform(smoothX, [-150, 0, 150], [-15, 0, 15]);

  // Corner distortions for organic liquid feel
  const distortTL = useTransform(
    [smoothX, smoothY],
    ([x, y]) => Math.sqrt((x as number) ** 2 + (y as number) ** 2) * 0.05
  );
  const distortTR = useTransform(
    [smoothX, smoothY],
    ([x, y]) => Math.sqrt(((x as number) - 100) ** 2 + (y as number) ** 2) * 0.05
  );
  const distortBL = useTransform(
    [smoothX, smoothY],
    ([x, y]) => Math.sqrt((x as number) ** 2 + ((y as number) - 100) ** 2) * 0.05
  );
  const distortBR = useTransform(
    [smoothX, smoothY],
    ([x, y]) => Math.sqrt(((x as number) - 100) ** 2 + ((y as number) - 100) ** 2) * 0.05
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      
      mouseX.set(distX);
      mouseY.set(distY);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    // Track mouse globally for proximity effect
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX ** 2 + distY ** 2);
      
      // Only apply effect when cursor is within 200px of card
      if (distance < 200) {
        const factor = (200 - distance) / 200;
        mouseX.set(distX * factor);
        mouseY.set(distY * factor);
      } else {
        mouseX.set(0);
        mouseY.set(0);
      }
    };

    card.addEventListener('mouseenter', () => setIsHovered(true));
    card.addEventListener('mouseleave', () => {
      setIsHovered(false);
      handleMouseLeave();
    });
    card.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      card.removeEventListener('mouseenter', () => setIsHovered(true));
      card.removeEventListener('mouseleave', () => {
        setIsHovered(false);
        handleMouseLeave();
      });
      card.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [mouseX, mouseY]);

  // Generate clip path based on distortions
  const clipPath = useTransform(
    [distortTop, distortBottom, distortLeft, distortRight, distortTL, distortTR, distortBL, distortBR],
    ([top, bottom, left, right, tl, tr, bl, br]) => {
      const t = top as number;
      const b = bottom as number;
      const l = left as number;
      const r = right as number;
      
      // Create organic blob shape with bezier curves
      return `path('
        M ${10 + l + (tl as number)} ${5 + t}
        Q 50 ${-5 + t} ${90 - r - (tr as number)} ${5 + t}
        Q ${95 + r} 50 ${95 + r - (br as number)} ${95 + b}
        Q 50 ${105 + b} ${5 + l + (bl as number)} ${95 + b}
        Q ${-5 + l} 50 ${5 + l + (tl as number)} ${5 + t}
        Z
      ')`;
    }
  );

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${aspectRatio} ${className}`}
      style={{
        clipPath,
        borderRadius: '16px',
      }}
      animate={{
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Inner content wrapper to prevent clipping issues */}
      <div className="absolute inset-0 overflow-hidden">
        {children}
      </div>
      
      {/* Liquid overlay effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: isHovered ? 0.1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.3) 0%, transparent 50%)',
        }}
      />
    </motion.div>
  );
}
