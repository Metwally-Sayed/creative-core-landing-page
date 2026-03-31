"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface LiquidCardProps {
  children: ReactNode;
  className?: string;
  aspectRatio?: string;
}

interface BorderPoint {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

const BASE_RADIUS = 22;
const PROXIMITY_RADIUS = 230;
const MAX_PULL = 30;
const EDGE_POINTS = 5;
const ARC_POINTS = 5;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildRoundedRectPoints(width: number, height: number, radius: number) {
  const points: BorderPoint[] = [];
  const r = Math.min(radius, width / 2, height / 2);

  const pushEdge = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    nx: number,
    ny: number
  ) => {
    for (let index = 0; index < EDGE_POINTS; index += 1) {
      const progress = index / EDGE_POINTS;
      points.push({
        x: x1 + (x2 - x1) * progress,
        y: y1 + (y2 - y1) * progress,
        nx,
        ny,
      });
    }
  };

  const pushArc = (
    centerX: number,
    centerY: number,
    startAngle: number,
    endAngle: number
  ) => {
    for (let index = 0; index < ARC_POINTS; index += 1) {
      const progress = index / ARC_POINTS;
      const angle = startAngle + (endAngle - startAngle) * progress;
      points.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
        nx: Math.cos(angle),
        ny: Math.sin(angle),
      });
    }
  };

  pushEdge(r, 0, width - r, 0, 0, -1);
  pushArc(width - r, r, -Math.PI / 2, 0);
  pushEdge(width, r, width, height - r, 1, 0);
  pushArc(width - r, height - r, 0, Math.PI / 2);
  pushEdge(width - r, height, r, height, 0, 1);
  pushArc(r, height - r, Math.PI / 2, Math.PI);
  pushEdge(0, height - r, 0, r, -1, 0);
  pushArc(r, r, Math.PI, Math.PI * 1.5);

  return points;
}

function distortBorder(
  points: BorderPoint[],
  cursorX: number,
  cursorY: number,
  force: number,
  width: number,
  height: number
) {
  if (force <= 0.001) {
    return points;
  }

  const influenceRadius = Math.min(Math.max(width, height) * 0.55, 220);

  return points.map((point) => {
    const dx = cursorX - point.x;
    const dy = cursorY - point.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0 || distance > influenceRadius) {
      return point;
    }

    const falloff = 1 - distance / influenceRadius;
    const normalAlignment = clamp((dx * point.nx + dy * point.ny) / distance, -1, 1);
    const pullStrength =
      MAX_PULL * force * Math.pow(falloff, 1.7) * (0.68 + Math.max(normalAlignment, 0) * 0.52);

    return {
      ...point,
      x: point.x + (dx / distance) * pullStrength,
      y: point.y + (dy / distance) * pullStrength,
    };
  });
}

function createSmoothPath(points: BorderPoint[]) {
  if (points.length === 0) {
    return "";
  }

  const firstMidX = (points[0].x + points[1].x) / 2;
  const firstMidY = (points[0].y + points[1].y) / 2;
  let path = `M ${firstMidX.toFixed(2)} ${firstMidY.toFixed(2)}`;

  for (let index = 1; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;

    path += ` Q ${current.x.toFixed(2)} ${current.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }

  path += " Z";
  return path;
}

export default function LiquidCard({
  children,
  className = "",
  aspectRatio = "aspect-[4/3]",
}: LiquidCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasMeasured, setHasMeasured] = useState(false);

  const widthValue = useMotionValue(0);
  const heightValue = useMotionValue(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const pointerForce = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 24, mass: 0.6 };
  const smoothX = useSpring(pointerX, springConfig);
  const smoothY = useSpring(pointerY, springConfig);
  const smoothForce = useSpring(pointerForce, { stiffness: 140, damping: 22, mass: 0.7 });

  const shapePath = useTransform(
    [smoothX, smoothY, smoothForce, widthValue, heightValue],
    ([x, y, force, width, height]) => {
      const cardWidth = width as number;
      const cardHeight = height as number;

      if (cardWidth <= 0 || cardHeight <= 0) {
        return "";
      }

      const basePoints = buildRoundedRectPoints(cardWidth, cardHeight, BASE_RADIUS);
      const deformedPoints = distortBorder(
        basePoints,
        x as number,
        y as number,
        force as number,
        cardWidth,
        cardHeight
      );

      return createSmoothPath(deformedPoints);
    }
  );

  const clipPath = useTransform(shapePath, (path) => (path ? `path("${path}")` : "none"));
  const highlightX = useTransform([smoothX, widthValue], ([x, width]) => {
    const safeWidth = Math.max(width as number, 1);
    return `${clamp(((x as number) / safeWidth) * 100, 0, 100).toFixed(1)}%`;
  });
  const highlightY = useTransform([smoothY, heightValue], ([y, height]) => {
    const safeHeight = Math.max(height as number, 1);
    return `${clamp(((y as number) / safeHeight) * 100, 0, 100).toFixed(1)}%`;
  });
  const borderOpacity = useTransform(smoothForce, [0, 1], [0.18, 0.5]);
  const glowOpacity = useTransform(smoothForce, [0, 1], [0, 0.2]);
  const glowBackground = useMotionTemplate`radial-gradient(180px circle at ${highlightX} ${highlightY}, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)`;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return;
    }

    const updateSize = () => {
      const rect = card.getBoundingClientRect();
      widthValue.set(rect.width);
      heightValue.set(rect.height);
      setHasMeasured(rect.width > 0 && rect.height > 0);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(card);

    const handleGlobalMouseMove = (event: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const deltaX =
        event.clientX < rect.left
          ? rect.left - event.clientX
          : event.clientX > rect.right
            ? event.clientX - rect.right
            : 0;
      const deltaY =
        event.clientY < rect.top
          ? rect.top - event.clientY
          : event.clientY > rect.bottom
            ? event.clientY - rect.bottom
            : 0;
      const distance = Math.hypot(deltaX, deltaY);
      const intensity = Math.pow(clamp(1 - distance / PROXIMITY_RADIUS, 0, 1), 0.82);

      pointerX.set(localX);
      pointerY.set(localY);
      pointerForce.set(intensity);
    };

    const handleWindowLeave = () => {
      pointerForce.set(0);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseleave", handleWindowLeave);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseleave", handleWindowLeave);
    };
  }, [heightValue, pointerForce, pointerX, pointerY, widthValue]);

  return (
    <motion.div
      ref={cardRef}
      className={`relative isolate overflow-hidden ${aspectRatio} ${className}`}
      style={
        hasMeasured
          ? {
              clipPath,
            }
          : {
              borderRadius: `${BASE_RADIUS}px`,
            }
      }
    >
      {children}

      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: glowOpacity,
          background: glowBackground,
          mixBlendMode: "screen",
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0"
        style={
          hasMeasured
            ? {
                clipPath,
                opacity: borderOpacity,
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.18)",
              }
            : {
                borderRadius: `${BASE_RADIUS}px`,
                opacity: borderOpacity,
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.18)",
              }
        }
      />
    </motion.div>
  );
}
