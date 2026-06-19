import { motion, type Variants } from "framer-motion";
import { use3DTilt } from "../hooks/use3DTilt";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.6, 0.05, -0.01, 0.9] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

interface StatData {
  value: string;
  label: string;
}

const stats: StatData[] = [
  { value: "1,400+", label: "Pitches Analyzed" },
  { value: "5", label: "Input Features" },
];

function TiltCard({ stat }: { stat: StatData }) {
  const { ref, rotateX, rotateY, boxShadow, handleMouse, handleLeave } =
    use3DTilt(12);

  return (
    <motion.div variants={fadeUp} style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        className="bg-white border border-gray-200 rounded-2xl p-8 text-center select-none"
        style={{ rotateX, rotateY, boxShadow }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <p className="text-5xl font-bold text-[#5B8DEF]">{stat.value}</p>
        <p className="mt-2 text-gray-500 text-lg">{stat.label}</p>
      </motion.div>
    </motion.div>
  );
}

export default function StatCards() {
  return (
    <section className="bg-[#F5F1EA] py-24">
      <motion.div
        className="max-w-3xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-6"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {stats.map((s) => (
          <TiltCard key={s.label} stat={s} />
        ))}
      </motion.div>
    </section>
  );
}
