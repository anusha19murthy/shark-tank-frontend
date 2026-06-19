import { useEffect, useState, useCallback, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  parallaxFactor: number;
  /* Per-bubble randomized float offsets so no two move identically */
  floatYA: number;
  floatYB: number;
  floatXA: number;
  floatXB: number;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const colors = [
  "rgba(91,141,239,0.22)",
  "rgba(91,141,239,0.14)",
  "rgba(91,141,239,0.30)",
  "rgba(245,241,234,0.55)",
  "rgba(245,241,234,0.40)",
  "rgba(91,141,239,0.18)",
  "rgba(200,220,255,0.25)",
  "rgba(91,141,239,0.10)",
];

function makeBubble(id: number, burst: boolean): Bubble {
  return {
    id,
    x: randomBetween(3, 97),
    y: randomBetween(5, 95),
    size: burst ? randomBetween(20, 120) : randomBetween(8, 100),
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: burst ? randomBetween(0, 0.8) : randomBetween(0, 2.5),
    duration: burst ? randomBetween(2, 4) : randomBetween(5, 16),
    parallaxFactor: randomBetween(0.2, 1.0),
    floatYA: randomBetween(-30, -10),
    floatYB: randomBetween(8, 25),
    floatXA: randomBetween(-18, -5),
    floatXB: randomBetween(5, 18),
  };
}

const burstVariants: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  show: (b: Bubble) => ({
    opacity: 1,
    scale: 1,
    y: [0, randomBetween(-30, -80)],
    x: [0, randomBetween(-20, 20)],
    transition: {
      delay: b.delay,
      duration: b.duration,
      ease: "easeOut",
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 1.2 },
  },
};

/**
 * Parallax wrapper — shifts position based on mouse via spring.
 * This is a SEPARATE element from the float animation so they don't conflict.
 */
function ParallaxWrapper({
  b,
  mouseX,
  mouseY,
  children,
}: {
  b: Bubble;
  mouseX: number;
  mouseY: number;
  children: React.ReactNode;
}) {
  const offsetX = (mouseX - 0.5) * -40 * b.parallaxFactor;
  const offsetY = (mouseY - 0.5) * -40 * b.parallaxFactor;

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mvY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    mvX.set(offsetX);
    mvY.set(offsetY);
  }, [offsetX, offsetY, mvX, mvY]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${b.x}%`,
        top: `${b.y}%`,
        x: springX,
        y: springY,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Inner floating bubble — handles the looping drift animation.
 * Uses animate prop (not variants) to avoid x/y conflict with parent.
 */
function FloatingBubble({ b }: { b: Bubble }) {
  /* Memoize keyframes so they're stable across renders */
  const animateProps = useMemo(
    () => ({
      y: [0, b.floatYA, b.floatYB, b.floatYA * 0.6, 0],
      x: [0, b.floatXA, b.floatXB, b.floatXA * 0.5, 0],
      opacity: [0, 0.85, 1, 0.75, 0.85],
      scale: [0.85, 1, 0.92, 1.02, 0.85],
    }),
    [b.floatYA, b.floatYB, b.floatXA, b.floatXB]
  );

  const transitionProps = useMemo(
    () => ({
      delay: b.delay,
      duration: b.duration,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut" as const,
    }),
    [b.delay, b.duration]
  );

  return (
    <motion.div
      className="rounded-full"
      style={{
        width: b.size,
        height: b.size,
        backgroundColor: b.color,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={animateProps}
      transition={transitionProps}
    />
  );
}

export default function HeroBubbles() {
  const [phase, setPhase] = useState<"burst" | "ambient">("burst");
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const [burstBubbles] = useState(() =>
    Array.from({ length: 22 }, (_, i) => makeBubble(i, true))
  );
  const [ambientBubbles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => makeBubble(i + 100, false))
  );

  useEffect(() => {
    const timer = setTimeout(() => setPhase("ambient"), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    },
    []
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ pointerEvents: phase === "ambient" ? "auto" : "none" }}
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence>
        {phase === "burst" &&
          burstBubbles.map((b) => (
            <motion.div
              key={b.id}
              custom={b}
              variants={burstVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="absolute rounded-full"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                backgroundColor: b.color,
              }}
            />
          ))}
      </AnimatePresence>

      {phase === "ambient" &&
        ambientBubbles.map((b) => (
          <ParallaxWrapper
            key={b.id}
            b={b}
            mouseX={mousePos.x}
            mouseY={mousePos.y}
          >
            <FloatingBubble b={b} />
          </ParallaxWrapper>
        ))}
    </div>
  );
}
