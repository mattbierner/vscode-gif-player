import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Gif } from 'util/loadGif';

interface ControlsState {
    isDragging?: boolean;
}

/**
 * Controls for the git player.
 */
export function Controls(props: {
    gif: Gif;
    frame: number;
    playing: boolean;
    updateIsDragging: (isDragging: boolean) => void;
    updateFrame: (frame: number) => void;
    updatePlaying: (playing: boolean) => void;
}) {
    const [state, setState] = useState<ControlsState>({});

    const stateRef = useRef<ControlsState>();
    stateRef.current = state;

    useEffect(() => {
        const listener = () => {
            if (stateRef.current?.isDragging) {
                setState({ ...stateRef.current, isDragging: false });
            }
        };

        document.addEventListener('mouseup', listener);

        return () => {
            document.removeEventListener('mouseup', listener);
        };
    }, [props.updateIsDragging]);

    return (
        <div style={{
            flex: 1,
            padding: '1em 2em',
            borderTop: '1px solid var(--vscode-editorWidget-border)',
            background: 'var(--vscode-editorWidget-background)',
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                paddingBottom: '0.6em',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <input
                    className='frame-slider'
                    type='range'
                    min='0'
                    max={props.gif.frames.length - 1}
                    value={props.frame}
                    style={{
                        display: 'block',
                        flex: 1,
                    }}
                    onInput={e => {
                        const frame = +(e.target as HTMLInputElement).value;
                        props.updateFrame(frame);
                    }}
                    onMouseDown={e => {
                        setState({ ...state, isDragging: true });
                    }} />

                <div style={{
                    textAlign: 'center',
                }}>
                    <span style={{
                        display: 'block',
                        float: 'left',
                        marginLeft: '0.2em',
                    }}>{1}</span>

                    <span style={{}}>{props.frame + 1}</span>

                    <span style={{
                        display: 'block',
                        float: 'right',
                        marginRight: '0.2em',
                    }}>{props.gif.frames.length}</span>
                </div>
            </div>

            <div style={{
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
            }}>
                <ControlButton
                    className='previousButton'
                    title={"Previous Frame"}
                    icon={'codicon-debug-step-back'}
                    style={{
                        marginRight: '1em',
                    }}
                    onClick={() => {
                        props.updateFrame(props.frame - 1);
                    }} />

                <ControlButton
                    className='playButton'
                    title={props.playing ? "Pause" : "Play"}
                    icon={props.playing ? 'codicon-play' : 'codicon-pause'}
                    onClick={() => {
                        props.updatePlaying(!props.playing);
                    }} />

                <ControlButton
                    className='nextButton'
                    title={"Next Frame"}
                    icon={'codicon-debug-step-over'}
                    style={{
                        marginLeft: '1em',
                    }}
                    onClick={() => {
                        props.updateFrame(props.frame + 1);
                    }} />
            </div>
        </div>
    );
}

function ControlButton(props: {
    title: string,
    className: string,
    icon: string,
    style?: any,
    onClick: () => void,
}) {
    return (
        <button
            className={props.className}
            title={props.title}
            style={{
                background: 'var(--vscode-input-background)',
                margin: 0,
                padding: 0,
                border: 0,
                ...props.style
            }}
            onClick={props.onClick}>
            <div className={`codicon ${props.icon}`} style={{
                color: 'var(--vscode-input-foreground)',
                width: '32px',
                height: '24px',
                lineHeight: '24px',

            }} />
        </button >
    );
}
