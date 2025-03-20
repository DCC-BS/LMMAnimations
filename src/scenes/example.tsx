import { makeScene2D, Txt, Layout, Node, Code, Rect } from '@motion-canvas/2d';
import { createRef, createSignal, all, waitFor, easeInOutCubic, Signal, SimpleSignal, Reference, SignalGenerator, ThreadGenerator } from '@motion-canvas/core';
// Import our new component
import { WordPrediction } from '../components/WordPrediction';
import type { Prediction, PredoctionStep } from '../models/prediction';
import { config } from '../config';

let mainTextRaw = wrap(config.startText);


function wordWithWrap(text: string, word: string, width: number = 40): string {
    const lastLine = text.split("\n").pop();
    if (lastLine && lastLine.length + word.length > width) {
        return "\n" + word;
    }

    return " " + word;
}

function wrap(text: string, width: number = 40): string {
    const words = text.split(" ");
    let result = "";
    let line = "";
    for (const word of words) {
        const testLine = line + word + " ";
        if (testLine.length > width) {
            result += line + "\n";
            line = word + " ";
        }
        else {
            line = testLine;
        }
    }
    result += line;
    return result.trim();
}

function* animatePredictions(
    step: PredoctionStep,
    wordRefs: Reference<WordPrediction>[],
    mainText: Reference<Code>,
    textHighlight: Reference<Rect>,
    speedFactor: number = 1) { // Add speed factor parameter with default value of 1

    const currentPredictions = step.predictions;

    // Calculate adjusted animation durations based on speed factor
    const textChangeDuration = 0.2 / speedFactor;
    const barAnimationDuration = 0.8 / speedFactor;
    const highlightDuration = 1 / speedFactor;
    const waitDuration = 1 / speedFactor;
    const textAppendDuration = 1 / speedFactor;

    const newWordTextAnimations = [];

    textHighlight().opacity(0);

    // Reset the appearance of prediction components
    for (let i = 0; i < wordRefs.length; i++) {
        const component = wordRefs[i]();
        component.wordTextRef().fill("black"); // Reset color
        component.probability(0); // Reset probability
        // component.probBarRef().width(0);
        component.percentTextRef().opacity(0);
        component.percentTextRef().text(`${Math.round(currentPredictions[i].probability * 100)}%`);
    }

    for (let i = 0; i < wordRefs.length; i++) {
        const component = wordRefs[i]();
        const animation = component.wordTextRef().text(currentPredictions[i].word, textChangeDuration);
        newWordTextAnimations.push(animation);
    }

    yield* all(...newWordTextAnimations);

    const animations = [] as ThreadGenerator[];

    // Animate the prediction bars one by one
    for (let i = 0; i < currentPredictions.length; i++) {
        const predictionComponent = wordRefs[i]();
        const percentText = predictionComponent.percentTextRef();

        // Calculate the bar width based on probability
        // const barWidth = predictionComponent.getBarWidth();

        // Animate the bar growing
        const barAnimation = all(
            predictionComponent.probability(currentPredictions[i].probability, barAnimationDuration, easeInOutCubic),
            // probBar.width(barWidth, barAnimationDuration, easeInOutCubic),
            percentText.opacity(0, 0).to(1, barAnimationDuration)
        );

        animations.push(all(barAnimation));
    }

    yield* all(...animations);

    // Highlight the highest probability word and add it to the text
    yield* waitFor(waitDuration);

    // Get the first prediction (highest probability)
    const selectedPrediction = currentPredictions[step.selectedPrediction].word;
    const bestPredictionComponent = wordRefs[step.selectedPrediction]();
    const bestWordRef = bestPredictionComponent.wordTextRef();
    yield* bestWordRef.fill("#4CAF50", highlightDuration);

    // Animate adding the selected word to the input text with adjusted duration
    const newWord = wordWithWrap(mainTextRaw, selectedPrediction);
    yield* mainText().code.append(textAppendDuration)`${newWord}`;
    mainTextRaw += newWord;

    const textRange = mainText().findLastRange(selectedPrediction);
    const bboxes = mainText().getSelectionBBox(textRange);
    const first = bboxes[0];
    const higlightRange = first.expand([4, 8]);

    textHighlight().position(higlightRange.position);
    textHighlight().size(higlightRange.size);
    yield* textHighlight().opacity(1, highlightDuration);
    return selectedPrediction;
}

export default makeScene2D(function* (view) {
    // Create references for our elements
    const containerRef = createRef<Layout>();
    const predictionsRef = createRef<Layout>();
    // Create an array of WordPrediction refs

    // Create signals for our animation
    const mainText = createRef<Code>();
    const textHighlight = createRef<Rect>();
    mainTextRaw = wrap(config.startText);

    const predictions = createSignal<Prediction[]>([
        { word: "", probability: 0.1 },
        { word: "", probability: 0.1 },
        { word: "", probability: 0.1 },
        { word: "", probability: 0.1 },
        { word: "", probability: 0.1 },
    ]);

    const wordPredictionRefs = predictions().map(() => createRef<WordPrediction>());

    // Add main container with left and right sections
    view.add(
        <Node>
            <Code
                position={[-90, -400]}
                ref={mainText}
                code={wrap(config.startText)}
                fontSize={80}
                fill="black"
                fontWeight={600}
            >
                <Rect
                    ref={textHighlight}
                    offset={-1}
                    lineWidth={4}
                    stroke={'blue'}
                    opacity={0}
                    radius={8}
                />
            </Code>
            <Layout ref={containerRef} layout direction="row" gap={50} width="100%" height="100%">

                {/* Left section - Input text */}
                <Layout width="40%" height="100%" justifyContent="stretch" alignContent="center">

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
                    marginTop={50}
                >
                    {predictions().map((prediction, index) => (
                        <WordPrediction scale={1.5}
                            ref={wordPredictionRefs[index]}
                        // word={prediction.word}
                        // probability={prediction.probability}
                        // maxBarWidth={maxBarWidth}
                        // isHighest={index === p}
                        />
                    ))}
                </Layout>
            </Layout>
        </Node>
    );

    // Extract animation to a function that can be reused


    // Initial animation of input text
    for (const step of config.predictionSteps) {
        predictions(step.predictions);
        yield* animatePredictions(step, wordPredictionRefs, mainText, textHighlight, step.speed);
    }
});