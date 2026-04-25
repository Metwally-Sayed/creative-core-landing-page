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
  baseImageScale = 0.17,
  hoverScale = 1.18,
  perspective = 1000,
  autoRotate = false,
  autoRotateSpeed = 0.6,
  className = "",
}) => {
  const [rotation, setRotation] = useState<RotationState>({ x: 15, y: 15, z: 0 });
  const [velocity, setVelocity] = useState<VelocityState>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SphereMediaItem | null>(null);
  const [isExpandedLoading, setIsExpandedLoading] = useState(false);
  const [isExpandedError, setIsExpandedError] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandOrigin, setExpandOrigin] = useState({ x: "50%", y: "50%" });

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

  // ─── Mouse handlers ───────────────────────────────────────────────────────────

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
    setRotation((prev) => ({ ...prev, y: prev.y + newVelocityX, x: prev.x - newVelocityY }));
  }, [dragSensitivity, isDragging, maxRotationSpeed, selectedItem]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // ─── Touch handlers ───────────────────────────────────────────────────────────

  const handleTouchStart = (e: React.TouchEvent) => {
    if (selectedItem) return;
    setIsDragging(true);
    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || selectedItem) return;
    e.preventDefault();
    const deltaX = e.touches[0].clientX - lastMousePos.current.x;
    const deltaY = e.touches[0].clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const newVelocityX = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, deltaX * dragSensitivity));
    const newVelocityY = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, deltaY * dragSensitivity));
    setVelocity({ x: newVelocityX, y: newVelocityY });
    setRotation((prev) => ({ ...prev, y: prev.y + newVelocityX, x: prev.x - newVelocityY }));
  }, [dragSensitivity, isDragging, maxRotationSpeed, selectedItem]);

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      container.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  // ─── Animation loop ───────────────────────────────────────────────────────────

  useEffect(() => {
    const animate = () => {
      setVelocity((prev) => ({ x: prev.x * momentumDecay, y: prev.y * momentumDecay }));
      setRotation((prev) => {
        const vx = autoRotate && !isDragging && !selectedItem ? autoRotateSpeed : velocity.x;
        const vy = velocity.y;
        return { ...prev, y: prev.y + vx, x: prev.x - vy };
      });
      animationFrame.current = requestAnimationFrame(animate);
    };
    animationFrame.current = requestAnimationFrame(animate);
    return () => { if (animationFrame.current) cancelAnimationFrame(animationFrame.current); };
  }, [isDragging, selectedItem, velocity.x, velocity.y, momentumDecay, autoRotate, autoRotateSpeed]);

  // ─── Modal / lightbox ─────────────────────────────────────────────────────────

  const closeModal = useCallback(() => {
    setSelectedItem(null);
    setIsExpandedLoading(false);
    setIsExpandedError(false);
    const trigger = triggerButtonRef.current;
    triggerButtonRef.current = null;
    if (trigger) window.setTimeout(() => trigger.focus(), 0);
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeModal(); return; }
      if (event.key !== "Tab") return;
      const container = modalRef.current;
      if (!container) return;
      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
      else if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [selectedItem, closeModal]);

  const openItem = (item: SphereMediaItem, trigger: HTMLButtonElement) => {
    const rect = trigger.getBoundingClientRect();
    setExpandOrigin({
      x: `${rect.left + rect.width / 2}px`,
      y: `${rect.top + rect.height / 2}px`,
    });
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
        onTouchStart={handleTouchStart}
        role="application"
        aria-label="Media sphere"
      >
        {/* Ambient inner glow — reads as a light source inside the sphere */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(ellipse at 38% 36%, rgba(255,255,255,0.09) 0%, transparent 62%)",
          }}
        />

        {items.map((item, index) => {
          const pos = worldPositions[index];
          if (!pos || !pos.isVisible) return null;

          const size = baseImageSize * pos.scale;
          const opacity = pos.fadeOpacity;
          const isHovered = hoveredIndex === index;
          const previewUrl = item.type === "video" ? item.posterUrl : item.url;

          // Depth-aware blur: items behind the equator get progressively blurrier
          const depthBlur = Math.max(0, (-pos.z / actualSphereRadius) * 2.2);

          return (
            <button
              key={item.id}
              type="button"
              className="absolute rounded-full"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: `translate(-50%, -50%) scale(${isHovered ? hoverScale : 1})`,
                width: size,
                height: size,
                zIndex: pos.zIndex,
                opacity,
                filter: depthBlur > 0.1 ? `blur(${depthBlur.toFixed(1)}px)` : undefined,
                boxShadow: isHovered
                  ? "0 0 0 2px rgba(255,255,255,0.95), 0 0 20px 3px rgba(255,255,255,0.22), 0 12px 40px rgba(0,0,0,0.28)"
                  : "0 4px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)",
                transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s ease",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              onClick={(event) => openItem(item, event.currentTarget)}
              aria-label={item.alt}
            >
              <span className="sr-only">{item.alt}</span>

              <div className="relative h-full w-full overflow-hidden rounded-full ring-1 ring-inset ring-white/15">
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

                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-lg">
                      <span className="absolute inset-0 animate-ping rounded-full bg-white/50" />
                      <Play className="relative h-3.5 w-3.5 translate-x-[1px] fill-current text-black" />
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedItem ? (
          <motion.div
            key="media-lightbox"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              background: "rgba(4,4,8,0.88)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={(event) => { if (event.target === event.currentTarget) closeModal(); }}
          >
            {/* Floating close button */}
            <motion.button
              ref={closeButtonRef}
              type="button"
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/75 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              onClick={closeModal}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* Media frame — scales out from the clicked tile's position */}
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={selectedItem.alt}
              className="relative overflow-hidden rounded-2xl"
              style={{
                width: "min(92vw, 960px)",
                height: "min(90svh, 860px)",
                transformOrigin: `${expandOrigin.x} ${expandOrigin.y}`,
              }}
              initial={{ opacity: 0, scale: 0.15, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              {selectedItem.type === "image" ? (
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.alt}
                  fill
                  sizes="(max-width: 768px) 92vw, 960px"
                  className="object-contain"
                  onLoad={() => setIsExpandedLoading(false)}
                  onError={() => { setIsExpandedLoading(false); setIsExpandedError(true); }}
                />
              ) : (
                <video
                  key={selectedItem.url}
                  src={selectedItem.url}
                  poster={selectedItem.posterUrl}
                  className="h-full w-full bg-black object-contain"
                  controls
                  playsInline
                  autoPlay
                  onCanPlay={() => setIsExpandedLoading(false)}
                  onError={() => { setIsExpandedLoading(false); setIsExpandedError(true); }}
                />
              )}

              {/* Caption scrim */}
              {selectedItem.alt ? (
                <motion.div
                  className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-4 pt-16"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 100%)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white/70">
                    {selectedItem.alt}
                  </p>
                </motion.div>
              ) : null}

              {isExpandedLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading…
                  </div>
                </div>
              ) : null}

              {isExpandedError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="rounded-2xl border border-white/10 bg-black/60 px-6 py-5 text-center text-sm backdrop-blur-sm">
                    <p className="font-semibold text-white/80">Failed to load</p>
                    <p className="mt-1 text-white/40">Check the URL in the CMS and try again.</p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default SphereImageGrid;
