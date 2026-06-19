import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { predict, type PredictionResult, type PredictionInput } from "../predict";
import { explainPrediction } from "../explain";
import { use3DTilt } from "../hooks/use3DTilt";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.6, 0.05, -0.01, 0.9] },
  },
};

// These MUST exactly match the categories the backend/model were trained on.
const industries = [
  "Automotive",
  "Business Services",
  "Children/Education",
  "Electronics",
  "Fashion/Beauty",
  "Fitness/Sports/Outdoors",
  "Food and Beverage",
  "Green/CleanTech",
  "Health/Wellness",
  "Lifestyle/Home",
  "Liquor/Alcohol",
  "Media/Entertainment",
  "Pet Products",
  "Technology/Software",
  "Travel",
  "Uncertain/Other",
];

const genders = ["Male", "Female", "Mixed Team"];
const teamTypes = ["Solo", "Multiple"];

function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white border border-gray-200 rounded-2xl p-6"
    >
      {children}
    </motion.div>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-gray-700 mb-3"
    >
      {children}
    </label>
  );
}

const inputBase =
  "w-full py-4 px-5 text-base text-gray-900 bg-[#F5F1EA]/40 border border-gray-200 rounded-2xl outline-none transition-all duration-200 hover:bg-[#5B8DEF]/[0.07] hover:border-[#5B8DEF]/40 focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 focus:shadow-lg focus:shadow-[#5B8DEF]/10 focus:-translate-y-0.5";

const selectBase =
  "w-full py-4 px-5 text-base text-gray-900 bg-[#F5F1EA]/40 border border-gray-200 rounded-2xl outline-none appearance-none transition-all duration-200 hover:bg-[#5B8DEF]/[0.07] hover:border-[#5B8DEF]/40 focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 focus:shadow-lg focus:shadow-[#5B8DEF]/10 focus:-translate-y-0.5";

const resultFade: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.6, 0.05, -0.01, 0.9] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.3 },
  },
};

const headingFadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.6, 0.05, -0.01, 0.9] },
  },
};

const subFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.1,
      ease: [0.6, 0.05, -0.01, 0.9],
    },
  },
};

const arrowShift: Variants = {
  rest: { x: 0 },
  hover: {
    x: [0, 5, 0],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
};


export default function PredictionForm() {
  const [askAmount, setAskAmount] = useState("");
  const [equity, setEquity] = useState("");
  const [industry, setIndustry] = useState("");
  const [gender, setGender] = useState("");
  const [teamType, setTeamType] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const {
    ref: btnRef,
    rotateX: btnRotateX,
    rotateY: btnRotateY,
    boxShadow: btnShadow,
    handleMouse: btnMouseMove,
    handleLeave: btnMouseLeave,
  } = use3DTilt<HTMLButtonElement>(10);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);
  setAiExplanation(null);

  const input: PredictionInput = {
    askAmount: Number(askAmount) || 0,
    equity: Number(equity) || 0,
    industry: industry || "Uncertain/Other",
    gender: gender || "Male",
    teamType: teamType || "Solo",
  };

  try {
    const prediction = await predict(input);

    setResult(prediction);

    setExplainLoading(true);

    explainPrediction(input, prediction)
      .then((res) => setAiExplanation(res.explanation))
      .catch(() => setAiExplanation(null))
      .finally(() => setExplainLoading(false));
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Couldn't reach the prediction server. Is the backend running on localhost:8000?"
    );

    setResult(null);
   
  } finally {
    setIsLoading(false);
  }
};

    

  return (
    <section id="predict" className="bg-white py-32">
      <div className="max-w-2xl mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4"
          variants={headingFadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          Prediction Engine
        </motion.h2>
        <motion.p
          className="text-gray-500 text-center mb-12 text-lg"
          variants={subFadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          Enter your pitch details and see if the sharks would bite.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* Ask Amount */}
          <FieldCard>
            <Label htmlFor="askAmount">Ask Amount ($)</Label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                $
              </span>
              <input
                id="askAmount"
                type="number"
                min="10000"
                max="5000000"
                placeholder="100000"
                value={askAmount}
                onChange={(e) => setAskAmount(e.target.value)}
                className={`${inputBase} pl-10`}
              />
            </div>
          </FieldCard>

          {/* Equity Offered */}
          <FieldCard>
            <Label htmlFor="equity">Equity Offered (%)</Label>
            <div className="relative">
              <input
                id="equity"
                type="number"
                min="1"
                max="100"
                placeholder="10"
                value={equity}
                onChange={(e) => setEquity(e.target.value)}
                className={`${inputBase} pr-10`}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                %
              </span>
            </div>
          </FieldCard>

          {/* Industry */}
          <FieldCard>
            <Label htmlFor="industry">Industry</Label>
            <div className="relative">
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={selectBase}
              >
                <option value="" disabled>
                  Select industry
                </option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </FieldCard>

          {/* Pitcher's Gender */}
          <FieldCard>
            <Label htmlFor="gender">Pitcher's Gender</Label>
            <div className="relative">
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={selectBase}
              >
                <option value="" disabled>
                  Select gender
                </option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </FieldCard>

          {/* Team Type — full width */}
          <div className="sm:col-span-2">
            <FieldCard>
              <Label htmlFor="teamType">Team Type</Label>
              <div className="relative">
                <select
                  id="teamType"
                  value={teamType}
                  onChange={(e) => setTeamType(e.target.value)}
                  className={selectBase}
                >
                  <option value="" disabled>
                    Select team type
                  </option>
                  {teamTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </FieldCard>
          </div>

          {/* Submit — full width, 3D tilt via shared hook */}
          <motion.div className="sm:col-span-2" variants={fadeUp}>
            <div style={{ perspective: 1000 }}>
              <motion.button
                ref={btnRef}
                type="submit"
                disabled={isLoading}
                onMouseMove={btnMouseMove}
                onMouseLeave={btnMouseLeave}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#5B8DEF] text-white font-semibold text-lg py-4 px-8 rounded-xl shadow-lg hover:bg-[#4A7DE0] hover:shadow-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  rotateX: btnRotateX,
                  rotateY: btnRotateY,
                  boxShadow: btnShadow,
                }}
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.96 }}
              >
                {isLoading ? "Asking the sharks..." : "Predict My Deal"}
                {!isLoading && (
                  <motion.svg
                    variants={arrowShift}
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
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.form>

{/* Result */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.dealProbability}
              variants={resultFade}
              initial="hidden"
              animate="show"
              exit="exit"
              className={`mt-8 rounded-2xl p-8 text-center border ${
                result.gotDeal
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="text-5xl font-bold mb-2">
                {result.gotDeal ? "Deal!" : "No Deal"}
              </p>
              <p className="text-lg text-gray-600">
                Predicted probability:{" "}
                <span className="font-semibold text-gray-900">
                  {(result.dealProbability * 100).toFixed(1)}%
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {/* AI Shark Verdict -- the "why" explanation */}
<AnimatePresence>
  {aiExplanation && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mt-6"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
        What the sharks have to say
      </h3>

      {aiExplanation ? (
        <motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4 }}
  className="max-w-3xl mx-auto text-gray-700 leading-8 text-left"
>
  {aiExplanation}
</motion.p>
      ) : (
        <>
          {explainLoading && (
            <p className="text-center text-sm text-gray-400 mb-4 animate-pulse">
              Asking the AI shark panel...
            </p>
          )}


          <p className="mt-5 text-sm text-gray-500 leading-relaxed text-center px-4">
            
          </p>
        </>
      )}
    </motion.div>
  )}
</AnimatePresence>

        
      </div>
    </section>
  );
}
