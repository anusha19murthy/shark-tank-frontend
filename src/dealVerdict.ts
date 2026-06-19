import type { PredictionInput, PredictionResult } from "./predict";

// Real deal rates by industry, from your actual EDA (1481 labeled pitches).
const INDUSTRY_DEAL_RATES: Record<string, number> = {
  Automotive: 0.76,
  "Media/Entertainment": 0.71,
  "Lifestyle/Home": 0.67,
  "Uncertain/Other": 0.67,
  "Children/Education": 0.66,
  "Fitness/Sports/Outdoors": 0.63,
  "Food and Beverage": 0.61,
  "Health/Wellness": 0.61,
  "Liquor/Alcohol": 0.58,
  "Fashion/Beauty": 0.58,
  "Pet Products": 0.57,
  "Technology/Software": 0.56,
  Electronics: 0.53,
  "Business Services": 0.52,
  "Green/CleanTech": 0.50,
  Travel: 0.45,
};

const OVERALL_DEAL_RATE = 0.617;

export interface VerdictFactor {
  text: string;
}

export interface Verdict {
  factors: VerdictFactor[];
  caveat: string;
}

export function generateVerdict(
  input: PredictionInput,
  result: PredictionResult
): Verdict {
  const factors: VerdictFactor[] = [];

  // Ask amount commentary -- this is the single biggest factor the real
  // model leans on (about a third of its decision-making, per feature
  // importance analysis).
  if (input.askAmount <= 100_000) {
    factors.push({
      text: `A $${input.askAmount.toLocaleString()} ask is on the lower end — historically, smaller asks tend to read as lower-risk to investors.`,
    });
  } else if (input.askAmount >= 1_000_000) {
    factors.push({
      text: `A $${input.askAmount.toLocaleString()} ask is substantial. Bigger asks invite more scrutiny on valuation and traction.`,
    });
  } else {
    factors.push({
      text: `A $${input.askAmount.toLocaleString()} ask sits in a fairly typical range for pitches in this dataset.`,
    });
  }

  // Equity commentary -- the second-biggest factor.
  if (input.equity < 5) {
    factors.push({
      text: `Offering only ${input.equity}% equity can come across as undervaluing what investors bring beyond cash — a common sticking point.`,
    });
  } else if (input.equity > 40) {
    factors.push({
      text: `Offering ${input.equity}% equity is unusually high — sometimes read as a lack of confidence in the company's own valuation.`,
    });
  } else {
    factors.push({
      text: `A ${input.equity}% equity offer falls within the range most pitches in this dataset used.`,
    });
  }

  // Industry, using the REAL rate from your EDA, not a guess.
  const industryRate = INDUSTRY_DEAL_RATES[input.industry];
  if (industryRate !== undefined) {
    const diff = industryRate - OVERALL_DEAL_RATE;
    const direction =
      diff > 0.03 ? "above" : diff < -0.03 ? "below" : "close to";
    factors.push({
      text: `${input.industry} pitches in this dataset got deals ${(
        industryRate * 100
      ).toFixed(0)}% of the time — ${direction} the overall average of ${(
        OVERALL_DEAL_RATE * 100
      ).toFixed(0)}%.`,
    });
  }

  // Team type / gender -- minor factors (single digits of importance),
  // worth saying so honestly rather than overselling them.
  factors.push({
    text: `Team makeup (${input.teamType}) and pitcher gender (${input.gender}) had only a small effect on the model's decision compared to the financial terms above.`,
  });

  const confidencePct = Math.round(result.dealProbability * 100);
  const certainty =
    confidencePct >= 75 || confidencePct <= 25
      ? "fairly confident in"
      : "genuinely uncertain about";

  return {
    factors,
    caveat: `The model is ${certainty} this call (${confidencePct}% confidence), but it only ever sees the numbers on the page — not how you'd actually perform in the room, the sharks' mood that day, a live product demo, or a bidding war between sharks. Real outcomes hinge on plenty this dataset never captured.`,
  };
}