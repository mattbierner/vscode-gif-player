import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { Gif } from 'util/loadGif';

/**
 * Draws a gif using a canvas.
 */
export function GifCanvas(props: {
    gif: Gif,
    frame: number,
    style?: any,
}) {
    const canvasRef = useRef<HTMLCanvasElement>();

    useEffect(() => {
        const frame = props.gif.frames[props.frame];
        if (!frame) {
            return;
        }

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.drawImage(frame.canvas, 0, 0);
        }
    }, [props.gif, props.frame]);

    return <canvas
        ref={canvasRef}
        style={props.style}
        width={props.gif.width}
        height={props.gif.height} />;
}
