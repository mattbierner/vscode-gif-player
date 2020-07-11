import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as actions from '../actions';
import { Gif } from '../util/loadGif';
import { GifCanvas } from './canvas';
import { Controls } from './controls';

interface State {
    readonly isDragging?: boolean;
}

interface GifPlayerProps {
    gif: Gif;
    playing: boolean;
    frame: number;
    dispatch: (action: actions.Actions) => void;
}

export function GifPlayer(props: GifPlayerProps) {
    const [state, setState] = useState<State>({});

    const stateRef = useRef<State & GifPlayerProps>();
    stateRef.current = { ...state, ...props };

    useEffect(() => {
        setTimeout(function renderLoop() {
            let nextTimeout = 100;
            if (stateRef.current?.playing && !stateRef.current.isDragging) {
                const nextFrame = (stateRef.current?.frame + 1) % props.gif.frames.length;
                const frame = props.gif.frames[nextFrame];
                nextTimeout = frame?.info.delay ? frame.info.delay * 10 : 30;
                props.dispatch(new actions.SetFrame(nextFrame));
            }
            setTimeout(renderLoop, nextTimeout);
        }, 0);
    }, [props.gif]);

    useEffect(() => {
        const listener = (e: MessageEvent): void => {
            switch (e.data.type) {
                case 'togglePlaying':
                    {
                        if (document.activeElement?.tagName === 'BUTTON' && document.activeElement.className === 'playButton') {
                            // We likely triggered this by pressing space on a button already.
                            // No need to do anything.
                            return;
                        }

                        return props.dispatch(new actions.TogglePlay(!props.playing));
                    }
                case 'nextFrame':
                    {
                        return props.dispatch(new actions.SetFrame((stateRef.current?.frame ?? 0) + 1));
                    }
                case 'previousFrame':
                    {
                        return props.dispatch(new actions.SetFrame((stateRef.current?.frame ?? 0) - 1));
                    }
            }
        };

        window.addEventListener('message', listener);

        return () => {
            window.removeEventListener('message', listener);
        };
    }, [props]);

    return (
        <main style={{
            display: 'grid',
            gridTemplateRows: '1fr auto',
        }}>
            <div style={{
                display: 'flex',
                flex: 1,
                overflow: 'scroll',
                overflowY: 'scroll',
            }}>
                <GifCanvas
                    gif={props.gif}
                    frame={props.frame}
                    style={{
                        display: 'block',
                        alignSelf: 'center',
                        margin: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                    }} />
            </div>

            <Controls
                gif={props.gif}
                frame={props.frame}
                playing={props.playing}
                updateFrame={frame => props.dispatch(new actions.SetFrame(frame))}
                updatePlaying={playing => props.dispatch(new actions.TogglePlay(playing))}
                updateIsDragging={isDragging => setState({ ...state, isDragging })} />
        </main >
    );
}

