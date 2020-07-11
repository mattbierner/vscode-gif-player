import { h, render } from 'preact';
import { useEffect, useReducer } from 'preact/hooks';
import * as actions from './actions';
import { GifPlayer } from './player';
import { AppStage, Loading } from './state';
import { loadGifFromUrl } from './util/loadGif';
import { getVSCodeState, setVSCodeState } from './vscodeState';

interface Configuration {
    readonly autoPlay: boolean;
}

const gifUrl = document.getElementById('data')?.dataset['uri']!;
const configuration: Configuration = JSON.parse(document.getElementById('data')?.dataset['configuration']!);

declare function acquireVsCodeApi(): any;
const vscode = acquireVsCodeApi();


function Main() {
    const [state, dispatch] = useReducer(actions.appStateReducer, new Loading());

    const init = async () => {
        try {
            const gif = await loadGifFromUrl(gifUrl);

            const vscodeState = getVSCodeState(vscode);

            dispatch(new actions.DidLoad(gif, vscodeState));
            if (typeof vscodeState?.frame !== 'undefined') {
                dispatch(new actions.SetFrame(vscodeState.frame));
            }

            if (vscodeState?.playing || (typeof vscodeState?.playing === 'undefined' && configuration.autoPlay)) {
                dispatch(new actions.TogglePlay(true));
            }
        } catch {
            dispatch(new actions.DidError("Could not load gif"));
        }
    };

    useEffect(() => {
        init();
    }, []);

    switch (state.stage) {
        case AppStage.Loading:
            {
                return (
                    <main style={{
                        display: 'grid'
                    }}>
                        <div style={{
                            justifySelf: 'center',
                            alignSelf: 'center',
                            textAlign: 'center',
                            userSelect: 'none',
                        }}>
                            <div className='codicon codicon-loading'
                                style={{
                                    fontSize: '2em',
                                }} />
                            <p>Loading gif...</p>
                        </div>

                    </main>
                );
            }
        case AppStage.Ready:
            {
                setVSCodeState(vscode, {
                    gifUrl,
                    playing: state.playing,
                    frame: state.frame,
                });

                return (
                    <GifPlayer
                        dispatch={dispatch}
                        gif={state.gif}
                        frame={state.frame}
                        playing={state.playing} />
                );
            }
        case AppStage.Errored:
            {
                return (
                    <main style={{
                        display: 'grid'
                    }}>
                        <div style={{
                            justifySelf: 'center',
                            alignSelf: 'center',
                            textAlign: 'center',
                        }}>
                            Error loading gif
                        </div>
                    </main>
                );
            }
    }
}

render(
    <Main />,
    document.body);
