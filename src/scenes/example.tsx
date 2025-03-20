import { makeScene2D, Rect, Txt, Layout, Line } from '@motion-canvas/2d';
import { createRef, createSignal, all, waitFor, easeInOutCubic, easeOutBack, easeOutQuad, easeInQuad, delay } from '@motion-canvas/core';
// Import our new component
import { WordPrediction } from '../components/WordPrediction';

export default makeScene2D(function* (view) {
    // Create references for our elements
    const containerRef = createRef<Layout>();
    const inputTextRef = createRef<Txt>();
    const predictionsRef = createRef<Layout>();
    // Create an array of WordPrediction refs

    // Create signals for our animation
    const mainText = createSignal("The weather today is");
    const predictions = createSignal([
        { word: "sunny", probability: 0.45 },
        { word: "nice", probability: 0.25 },
        { word: "cold", probability: 0.15 },
        { word: "going", probability: 0.10 },
        { word: "changing", probability: 0.05 },
    ]);

    const wordPredictionRefs = predictions().map(() => createRef<WordPrediction>());

    const maxBarWidth = 300; // Maximum width for probability bars

    // Add main container with left and right sections
    view.add(
        <Layout ref={containerRef} layout direction="row" gap={50} width="100%" height="100%">
            {/* Left section - Input text */}
            <Layout width="40%" height="100%" justifyContent="center" padding={20}>
                <Txt
                    ref={inputTextRef}
                    text={() => mainText()}
                    fontSize={40}
                    fill="#ffffff"
                    fontWeight={600}
                    textAlign="left"
                />
            </Layout>

            {/* Right section - Predictions with probability bars */}
            <Layout
                ref={predictionsRef}
                layout
                direction="column"
                gap={20}
                width="60%"
                height="100%"
                justifyContent="center"
                padding={20}
            >
                {predictions().map((prediction, index) => (
                    <WordPrediction
                        ref={wordPredictionRefs[index]}
                        word={prediction.word}
                        probability={prediction.probability}
                        maxBarWidth={maxBarWidth}
                        isHighest={index === 0}
                    />
                ))}
            </Layout>
        </Layout>
    );

    // Animate the input text appearing
    yield* inputTextRef().opacity(0, 0).to(1, 1);
    yield* waitFor(0.5);

    // Animate the prediction bars one by one
    for (let i = 0; i < predictions().length; i++) {
        const predictionComponent = wordPredictionRefs[i]();
        const wordText = predictionComponent.wordTextRef();
        const probBar = predictionComponent.probBarRef();
        const percentText = predictionComponent.percentTextRef();

        // Calculate the bar width based on probability
        const barWidth = predictionComponent.getBarWidth();

        // Animate word appearance
        yield* wordText.opacity(0, 0).to(1, 0.3);

        // Animate the bar growing
        yield* all(
            probBar.width(barWidth, 0.8, easeInOutCubic),
            percentText.opacity(0, 0).to(1, 0.8)
        );

        yield* waitFor(0.3);
    }

    // Highlight the highest probability word and add it to the text
    yield* waitFor(1);

    // Get the first prediction (highest probability)
    const selectedPrediction = predictions()[0].word;
    const bestPredictionComponent = wordPredictionRefs[0]();
    const bestWordRef = bestPredictionComponent.wordTextRef();
    yield* bestWordRef.fill("#4CAF50", 1);

    // Animate adding the selected word to the input text
    yield* mainText(`${mainText()} ${selectedPrediction}`, 1);

    // Add a blinking cursor effect at the end
    yield* waitFor(2);
});