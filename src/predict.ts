export interface PredictionInput {
  askAmount: number;
  equity: number;
  industry: string;
  gender: string;
  teamType: string;
}

export interface PredictionResult {
  dealProbability: number;
  gotDeal: boolean;
}

export async function predict(input: PredictionInput): Promise<PredictionResult> {
  const response = await fetch(
  'https://shark-tank-backend-4ufm.onrender.com/predict',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ask_amount: input.askAmount,
      equity_offered: input.equity,
      industry: input.industry,
      gender: input.gender,
      team_type: input.teamType,
    }),
  }
);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Prediction failed');
  }

  const data = await response.json();
  return {
    dealProbability: data.confidence,
    gotDeal: data.prediction === 'Deal',
  };
}