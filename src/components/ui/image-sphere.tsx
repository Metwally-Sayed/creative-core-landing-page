"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { HeroMediaItem } from "@/lib/hero-types";

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface SphericalPosition {
  theta: number;
  phi: number;
  radius: number;
}

export interface WorldPosition extends Position3D {
  scale: number;
  zIndex: number;
  isVisible: boolean;
  fadeOpacity: number;
  originalIndex: number;
}

export type SphereMediaItem = HeroMediaItem & {
  id: string;
};

export interface SphereImageGridProps {
  items?: SphereMediaItem[];
  containerSize?: number;
  sphereRadius?: number;
  dragSensitivity?: number;
  momentumDecay?: number;
  maxRotationSpeed?: number;
  baseImageScale?: number;
  hoverScale?: number;
  perspective?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  className?: string;
}

interface RotationState {
  x: number;
  y: number;
  z: number;
}

interface VelocityState {
  x: number;
  y: number;
}

interface MousePosition {
  x: number;
  y: number;
}

const SPHERE_MATH = {
  degreesToRadians: (degrees: number): number => degrees * (Math.PI / 180),
};

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getFocusableElements(container: HTMLElement) {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(",")));
}

const SphereImageGrid: React.FC<SphereImageGridProps> = ({
  items = [],
  containerSize = 400,
  sphereRadius = 200,
  dragSensitivity = 0.5,
  momentumDecay = 0.95,
  maxRotationSpeed = 5,
  baseImageScale = 0.12,
  hoverScale = 1.2,
  perspective = 1000,
  autoRotate = false,
  autoRotateSpeed = 0.3,
  className = "",
}) => {
  const [rotation, setRotation] = useState<RotationState>({ x: 15, y: 15, z: 0 });
  const [velocity, setVelocity] = useState<VelocityState>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SphereMediaItem | null>(null);
  const [isExpandedLoading, setIsExpandedLoading] = useState(false);
  const [isExpandedError, setIsExpandedError] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef<MousePosition>({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  const actualSphereRadius = sphereRadius || containerSize * 0.5;
  const baseImageSize = containerSize * baseImageScale;

  const spherePositions = useMemo((): SphericalPosition[] => {
    const positions: SphericalPosition[] = [];
    const mediaCount = items.length;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = (2 * Math.PI) / goldenRatio;

    const seed = hashString(items.map((item) => item.id).join("|") || String(mediaCount));
    const random = mulberry32(seed);

    for (let i = 0; i < mediaCount; i++) {
      const t = i / mediaCount;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      let phi = inclination * (180 / Math.PI);
      let theta = (azimuth * (180 / Math.PI)) % 360;

      const poleBonus = (Math.abs(phi - 90) / 90) ** 0.6 * 35;
      if (phi < 90) phi = Math.max(5, phi - poleBonus);
      else phi = Math.min(175, phi + poleBonus);

      phi = 15 + (phi / 180) * 150;
      const thetaOffset = (random() - 0.5) * 20;
      const phiOffset = (random() - 0.5) * 10;
      theta = (theta + thetaOffset) % 360;
      phi = Math.max(0, Math.min(180, phi + phiOffset));

      positions.push({ theta, phi, radius: actualSphereRadius });
    }

    return positions;
  }, [items, actualSphereRadius]);

  const worldPositions = useMemo((): WorldPosition[] => {
    return spherePositions.map((pos, index) => {
      const thetaRad = SPHERE_MATH.degreesToRadians(pos.theta);
      const phiRad = SPHERE_MATH.degreesToRadians(pos.phi);
      const rotXRad = SPHERE_MATH.degreesToRadians(rotation.x);
      const rotYRad = SPHERE_MATH.degreesToRadians(rotation.y);

      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad);
      let y = pos.radius * Math.cos(phiRad);
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad);

      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad);
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad);
      x = x1;
      z = z1;

      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad);
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad);
      y = y2;
      z = z2;

      const fadeZoneStart = -10;
      const fadeZoneEnd = -30;
      const isVisible = z > fadeZoneEnd;

      let fadeOpacity = 1;
      if (z <= fadeZoneStart) {
        fadeOpacity = Math.max(0, (z - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd));
      }

      const isPoleImage = pos.phi < 30 || pos.phi > 150;
      const distanceFromCenter = Math.sqrt(x * x + y * y);
      const maxDistance = actualSphereRadius;
      const distanceRatio = Math.min(distanceFromCenter / maxDistance, 1);
      const distancePenalty = isPoleImage ? 0.4 : 0.7;
      const centerScale = Math.max(0.3, 1 - distanceRatio * distancePenalty);
      const depthScale = (z + actualSphereRadius) / (2 * actualSphereRadius);
      const scale = centerScale * Math.max(0.5, 0.8 + depthScale * 0.3);

      return {
        x,
        y,
        z,
        scale,
        zIndex: Math.round(1000 + z),
        isVisible,
        fadeOpacity,
        originalIndex: index,
      };
    });
  }, [spherePositions, rotation.x, rotation.y, actualSphereRadius]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedItem) return;
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || selectedItem) return;

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    lastMousePos.current = { x: e.clientX, y: e.clientY };

    const newVelocityX = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, deltaX * dragSensitivity));
    const newVelocityY = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, deltaY * dragSensitivity));

    setVelocity({ x: newVelocityX, y: newVelocityY });

    setRotation((prev) => ({
      ...prev,
      y: prev.y + newVelocityX,
      x: prev.x - newVelocityY,
    }));
  }, [dragSensitivity, isDragging, maxRotationSpeed, selectedItem]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => handleMouseMove(e);
    const onUp = () => handleMouseUp();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const animate = () => {
      setVelocity((prev) => ({
        x: prev.x * momentumDecay,
        y: prev.y * momentumDecay,
      }));

      setRotation((prev) => {
        const vx = autoRotate && !isDragging && !selectedItem ? autoRotateSpeed : velocity.x;
        const vy = velocity.y;
        return {
          ...prev,
          y: prev.y + vx,
          x: prev.x - vy,
        };
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [isDragging, selectedItem, velocity.x, velocity.y, momentumDecay, autoRotate, autoRotateSpeed]);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
    setIsExpandedLoading(false);
    setIsExpandedError(false);

    const trigger = triggerButtonRef.current;
    triggerButtonRef.current = null;
    if (trigger) {
      window.setTimeout(() => trigger.focus(), 0);
    }
  }, []);

  useEffect(() => {
    if (!selectedItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;
      const container = modalRef.current;
      if (!container) return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const isShift = event.shiftKey;
      const active = document.activeElement;

      if (!isShift && active === last) {
        event.preventDefault();
        first.focus();
      } else if (isShift && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedItem, closeModal]);

  const openItem = (item: SphereMediaItem, trigger: HTMLButtonElement) => {
    triggerButtonRef.current = trigger;
    setIsExpandedLoading(true);
    setIsExpandedError(false);
    setSelectedItem(item);
  };

  return (
    <div className={`relative ${className}`} style={{ width: containerSize, height: containerSize }}>
      <div
        ref={containerRef}
        className="relative h-full w-full cursor-grab select-none active:cursor-grabbing"
        style={{ perspective }}
        onMouseDown={handleMouseDown}
        role="application"
        aria-label="Media sphere"
      >
        {items.map((item, index) => {
          const pos = worldPositions[index];
          if (!pos || !pos.isVisible) return null;
          const size = baseImageSize * pos.scale;
          const opacity = pos.fadeOpacity;
          const isHovered = hoveredIndex === index;
          const previewUrl = item.type === "video" ? item.posterUrl : item.url;

          return (
            <button
              key={item.id}
              type="button"
              className="absolute rounded-2xl border border-white/40 bg-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-transform"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: `translate(-50%, -50%) scale(${isHovered ? hoverScale : 1})`,
                width: size,
                height: size,
                zIndex: pos.zIndex,
                opacity,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              onClick={(event) => openItem(item, event.currentTarget)}
              aria-label={item.alt}
            >
              <span className="sr-only">{item.alt}</span>
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={item.alt}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,30,56,0.18)_0%,rgba(255,181,123,0.18)_100%)]" />
                )}
                {item.type === "video" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-accent shadow-[0_18px_38px_rgba(0,0,0,0.25)]">
                      <Play className="h-5 w-5 translate-x-[1px]" />
                    </span>
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedItem ? (
          <motion.div
            key="media-lightbox"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={selectedItem.alt}
              className="relative w-full max-w-[1100px] overflow-hidden rounded-[1.75rem] border border-white/30 bg-white/95 shadow-[0_34px_110px_rgba(0,0,0,0.42)]"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-accent/10 px-4 py-3">
                <p className="truncate text-sm font-semibold text-accent">{selectedItem.alt}</p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/10 bg-white text-accent shadow-sm transition hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative grid place-items-center bg-[radial-gradient(circle_at_50%_18%,rgba(11,30,56,0.06)_0%,rgba(11,30,56,0.02)_50%,rgba(255,255,255,0.0)_100%)] p-4 sm:p-6">
                <div className="relative h-[min(76vh,760px)] w-full">
                  {selectedItem.type === "image" ? (
                    <Image
                      src={selectedItem.url}
                      alt={selectedItem.alt}
                      fill
                      sizes="(max-width: 768px) 92vw, 1100px"
                      className="object-contain"
                      onLoad={() => setIsExpandedLoading(false)}
                      onError={() => {
                        setIsExpandedLoading(false);
                        setIsExpandedError(true);
                      }}
                    />
                  ) : (
                    <video
                      key={selectedItem.url}
                      src={selectedItem.url}
                      poster={selectedItem.posterUrl}
                      className="h-full w-full rounded-2xl bg-black object-contain"
                      controls
                      playsInline
                      autoPlay
                      onCanPlay={() => setIsExpandedLoading(false)}
                      onError={() => {
                        setIsExpandedLoading(false);
                        setIsExpandedError(true);
                      }}
                    />
                  )}

                  {isExpandedLoading ? (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="flex items-center gap-3 rounded-full border border-accent/10 bg-white/90 px-4 py-2 text-sm font-medium text-accent shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading media…
                      </div>
                    </div>
                  ) : null}

                  {isExpandedError ? (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="max-w-md rounded-2xl border border-accent/10 bg-white/95 p-5 text-center text-sm text-accent shadow-sm">
                        <p className="font-semibold">This media failed to load.</p>
                        <p className="mt-1 text-muted-foreground">
                          Check the URL or upload a new file in the CMS and try again.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default SphereImageGrid;
