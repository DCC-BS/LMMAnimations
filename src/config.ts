import { PredoctionStep } from './models/prediction';

const config: { startText: string; predictionSteps: PredoctionStep[] } = {
    startText: "Das Data Competence Center hilft dir bei",
    predictionSteps: [
        {
            selectedPrediction: 0,
            speed: 1, // Speed set to 1 for first step
            predictions: [
                { word: "der", probability: 0.40 }, // German articles and prepositions
                { word: "deinen", probability: 0.30 }, // Your (plural)
                { word: "allen", probability: 0.15 }, // All
                { word: "verschiedenen", probability: 0.10 }, // Various
                { word: "wichtigen", probability: 0.05 }, // Important
            ],
        },
        {
            selectedPrediction: 1,
            speed: 1, // Speed set to 1 for second step
            predictions: [
                { word: "Analyse", probability: 5 }, // Analysis
                { word: "Entwicklung", probability: 4 }, // Development
                { word: "Datenanalyse", probability: 3 }, // Data analysis
                { word: "Transformation", probability: 2 }, // Transformation
                { word: "Optimierung", probability: 1 }, // Optimization
            ],
        },
        {
            selectedPrediction: 0,
            speed: 3, // Speed set to 1 for third step
            predictions: [
                { word: "von", probability: 0.45 }, // Of
                { word: "deiner", probability: 0.25 }, // Your (singular)
                { word: "und", probability: 0.15 }, // And
                { word: "für", probability: 0.10 }, // For
                { word: "durch", probability: 0.05 }, // Through
            ],
        },
        {
            selectedPrediction: 0,
            speed: 3, // Speed set to 3 for fourth step
            predictions: [
                { word: "KI", probability: 0.35 }, // Data
                { word: "Lösungen", probability: 0.30 }, // Processes
                { word: "Daten", probability: 0.20 }, // Projects
                { word: "Processen", probability: 0.10 }, // Applications
                { word: "Projekten", probability: 0.05 }, // Solutions
            ],
        },
    ],
}

function softmax(x: number[]): number[] {
    const e = x.map((v) => Math.exp(v));
    const sum = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / sum);
}

config.predictionSteps.forEach((step) => {
    const ps = softmax(step.predictions.map((p) => p.probability));
    step.predictions.forEach((prediction) => {
        prediction.probability = ps.shift()!;
    });
    step.predictions.sort((a, b) => b.probability - a.probability);
});

export { config };