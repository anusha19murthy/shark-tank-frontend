import { motion, type Variants } from "framer-motion";
import HeroBubbles from "./HeroBubbles";
import { use3DTilt } from "../hooks/use3DTilt";

/* ── Word-by-word headline reveal ── */
const headlineWords = ["Will", "Your", "Pitch", "Land", "a", "Deal?"];

const wordStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const wordReveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.6, 0.05, -0.01, 0.9] },
  },
};

/* ── Sequenced entrance for subtext + button ── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.6, 0.05, -0.01, 0.9] },
  },
};

const heroSequence: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.7, // starts after headline finishes
    },
  },
};

/* ── Animated underline for "Land a Deal?" ── */
const underlineDraw: Variants = {
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: { duration: 0.6, delay: 0.65, ease: [0.6, 0.05, -0.01, 0.9] },
  },
};

/* ── Arrow bounce on hover ── */
const arrowBounce: Variants = {
  rest: { x: 0 },
  hover: {
    x: [0, 5, 0],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function Hero() {
  const { ref, rotateX, rotateY, boxShadow, handleMouse, handleLeave } =
    use3DTilt<HTMLAnchorElement>(10);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
      {/* Soft radial glow behind headline */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(91,141,239,0.08) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <HeroBubbles />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Word-by-word headline */}
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight"
          variants={wordStagger}
          initial="hidden"
          animate="show"
        >
          {headlineWords.map((word, i) => {
            const isHighlighted = word === "Land" || word === "a" || word === "Deal?";
            return (
              <motion.span
                key={i}
                variants={wordReveal}
                className="inline-block mr-[0.3em] last:mr-0 relative"
              >
                {word}
                {/* Draw underline beneath "Deal?" */}
                {word === "Deal?" && (
                  <motion.span
                    className="absolute left-0 -bottom-1 h-[3px] w-full bg-[#5B8DEF] origin-left rounded-full"
                    variants={underlineDraw}
                    initial="hidden"
                    animate="show"
                  />
                )}
                {isHighlighted && word !== "Deal?" && ""}
              </motion.span>
            );
          })}
        </motion.h1>

        {/* Sequenced subtext + button */}
        <motion.div variants={heroSequence} initial="hidden" animate="show">
          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            Trained on 1,400+ real Shark Tank pitches, this model will predict whether
            your startup would walk away with a deal or walk the plank. So let's see what the shark will have to say. Would Queen of QVC make a deal or Mr. Wonderful will slam it?
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10">
            <div style={{ perspective: 1000 }} className="inline-block">
              <motion.a
                ref={ref}
                href="#predict"
                onMouseMove={handleMouse}
                onMouseLeave={handleLeave}
                className="inline-flex items-center gap-2 bg-[#5B8DEF] text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-lg"
                style={{ rotateX, rotateY, boxShadow }}
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.96 }}
              >
                Make a Prediction
                <motion.svg
                  variants={arrowBounce}
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </motion.svg>
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
