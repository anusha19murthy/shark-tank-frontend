import { useRef } from "react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface Tilt3DResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  boxShadow: MotionValue<string>;
  handleMouse: (e: React.MouseEvent) => void;
  handleLeave: () => void;
}

export function use3DTilt<T extends HTMLElement = HTMLDivElement>(
  maxDeg = 12
): Tilt3DResult<T> {
  const ref = useRef<T>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [maxDeg, -maxDeg]),
    { stiffness: 200, damping: 18 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-maxDeg, maxDeg]),
    { stiffness: 200, damping: 18 }
  );

  const shadowX = useTransform(rotateY, [-maxDeg, maxDeg], [10, -10]);
  const shadowY = useTransform(rotateX, [-maxDeg, maxDeg], [-10, 10]);
  const boxShadow = useTransform(
    [shadowX, shadowY],
    ([sx, sy]) =>
      `${sx}px ${sy}px 24px rgba(91,141,239,0.18), 0 2px 8px rgba(0,0,0,0.06)`
  );

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return { ref, rotateX, rotateY, boxShadow, handleMouse, handleLeave };
}
