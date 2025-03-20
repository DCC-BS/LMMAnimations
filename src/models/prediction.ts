export type Prediction = {
    word: string;
    probability: number;
}


export type PredoctionStep = {
    selectedPrediction: number;
    predictions: Prediction[];
    speed: number;
}