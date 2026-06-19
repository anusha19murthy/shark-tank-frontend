// explain.ts
import type { PredictionInput, PredictionResult } from "./predict";

export interface AIExplanation {
  explanation: string;
}

export async function explainPrediction(
  input: PredictionInput,
  result: PredictionResult
): Promise<AIExplanation> {
  const response = await fetch(
  'https://shark-tank-backend-4ufm.onrender.com/explain',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ask_amount: input.askAmount,
      equity_offered: input.equity,
      industry: input.industry,
      gender: input.gender,
      team_type: input.teamType,
      prediction: result.gotDeal ? 'Deal' : 'No Deal',
      confidence: result.dealProbability,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Explanation failed');
  }

  const data = await response.json();
  return { explanation: data.explanation };
}