import {
    Layout,
    Rect,
    Txt,
    Node,
    NodeProps,
    initial,
    signal,
} from '@motion-canvas/2d';
import {
    SignalValue,
    SimpleSignal,
    createRef,
} from '@motion-canvas/core';

// Props interface for our WordPrediction component
export interface WordPredictionProps extends NodeProps {
    word?: SignalValue<string>;
    probability?: SignalValue<number>;
    maxBarWidth?: SignalValue<number>;
    isHighest?: SignalValue<boolean>;
}

export class WordPrediction extends Node {
    // Define properties with signals and initial values
    @initial('')
    @signal()
    public declare readonly word: SimpleSignal<string, this>;

    @initial(0)
    @signal()
    public declare readonly probability: SimpleSignal<number, this>;

    @initial(300)
    @signal()
    public declare readonly maxBarWidth: SimpleSignal<number, this>;

    @initial(false)
    @signal()
    public declare readonly isHighest: SimpleSignal<boolean, this>;

    // Create refs for the elements we'll need to animate
    public readonly wordTextRef = createRef<Txt>();
    public readonly probBarRef = createRef<Rect>();
    public readonly percentTextRef = createRef<Txt>();
    public readonly layout = createRef<Layout>();

    public constructor(props?: WordPredictionProps) {
        super({
            ...props,
        });

        // Build the component structure
        this.add(
            <Rect
                ref={this.layout}
                layout
                direction="row"
                gap={20}
                height={50}
                alignItems="center"
            >
                {/* Word prediction text */}
                <Txt
                    ref={this.wordTextRef}
                    text={() => this.word()}
                    fontSize={30}
                    fill="#ffffff"
                    fontWeight={500}
                    width={120}
                />

                {/* Probability bar background */}
                <Rect
                    width={() => this.maxBarWidth()}
                    height={30}
                    fill="#333333"
                    radius={5}
                />

                {/* Actual probability bar with initial width of 0 */}
                <Rect
                    ref={this.probBarRef}
                    width={0}
                    height={30}
                    fill={() => this.isHighest() ? "#4CAF50" : "#2196F3"} // Green for highest prob, blue for others
                    radius={5}
                    position={() => ({ x: -this.maxBarWidth() / 2, y: 0 })}
                    opacity={0.8}
                />

                {/* Percentage text */}
                <Txt
                    ref={this.percentTextRef}
                    text={() => `${(this.probability() * 100).toFixed(1)}%`}
                    fontSize={24}
                    fill="#ffffff"
                    fontWeight={500}
                    opacity={0}
                />
            </Rect>
        );
    }

    // Helper method to get bar width based on probability
    public getBarWidth(): number {
        return this.probability() * this.maxBarWidth();
    }
}
