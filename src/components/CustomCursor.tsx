import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type MotionStyle,
} from "framer-motion";

const CURSOR_SIZE = 20;
const HOVER_SIZE = 40;

export default function CustomCursor() {
  const [isTouch, setIsTouch] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { stiffness: 300, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 28 });

  useEffect(() => {
    // Detect touch device
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsTouch(true);
      return;
    }

    // Hide native cursor
    document.body.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onEnterInteractive = () => setHovered(true);
    const onLeaveInteractive = () => setHovered(false);

    window.addEventListener("mousemove", onMove);

    // Observe DOM for interactive elements and attach listeners
    const interactiveSelector =
      "a, button, input, select, textarea, [role='button']";

    const attach = (el: Element) => {
      el.addEventListener("mouseenter", onEnterInteractive);
      el.addEventListener("mouseleave", onLeaveInteractive);
    };
    const detach = (el: Element) => {
      el.removeEventListener("mouseenter", onEnterInteractive);
      el.removeEventListener("mouseleave", onLeaveInteractive);
    };

    // Attach to existing
    document.querySelectorAll(interactiveSelector).forEach(attach);

    // Observe new elements
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches(interactiveSelector)) attach(node);
            node.querySelectorAll(interactiveSelector).forEach(attach);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      document.querySelectorAll(interactiveSelector).forEach(detach);
      observer.disconnect();
    };
  }, [mouseX, mouseY, visible]);

  if (isTouch || !visible) return null;

  const size = hovered ? HOVER_SIZE : CURSOR_SIZE;

  const style: MotionStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: size,
    height: size,
    x: springX,
    y: springY,
    translateX: "-50%",
    translateY: "-50%",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 9999,
    border: hovered ? "2px solid #5B8DEF" : "none",
    backgroundColor: hovered ? "transparent" : "#5B8DEF",
    opacity: hovered ? 0.8 : 0.6,
  };

  return (
    <motion.div
      style={style}
      animate={{ width: size, height: size }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    />
  );
}
