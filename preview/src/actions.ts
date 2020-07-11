import * as appState from './state';
import { Gif } from './util/loadGif';
import { VSCodeState } from './vscodeState';

export enum ActionType {
    DidLoad,
    DidError,

    SetFrame,
    TogglePlay,
}

export class DidLoad {
    public readonly type = ActionType.DidLoad;

    constructor(
        public readonly gif: Gif,
        public readonly vscodeState: VSCodeState | undefined,
    ) { }
}

export class DidError {
    public readonly type = ActionType.DidError;

    constructor(
        public readonly error: string,
    ) { }
}

export class SetFrame {
    public readonly type = ActionType.SetFrame;

    constructor(
        public readonly frame: number,
    ) { }
}

export class TogglePlay {
    public readonly type = ActionType.TogglePlay;

    constructor(
        public readonly playing: boolean,
    ) { }
}

export type Actions =
    | DidLoad
    | DidError
    | SetFrame
    | TogglePlay;


export function appStateReducer(state: appState.AppState, action: Actions): appState.AppState {

    switch (action.type) {
        case ActionType.DidLoad:
            {
                return new appState.Ready(
                    action.gif,
                    action.vscodeState?.frame || 0,
                    false);
            }
        case ActionType.DidError:
            {
                return new appState.Errored(action.error);
            }
        case ActionType.SetFrame:
            {
                if (state.stage !== appState.AppStage.Ready) {
                    throw new Error('Bad state');
                }

                const frame = action.frame < 0
                    ? state.gif.frames.length + action.frame
                    : action.frame % state.gif.frames.length;

                return new appState.Ready(
                    state.gif,
                    frame,
                    state.playing);
            }
        case ActionType.TogglePlay:
            {
                if (state.stage !== appState.AppStage.Ready) {
                    throw new Error('Bad state');
                }

                return new appState.Ready(
                    state.gif,
                    state.frame,
                    action.playing);
            }
    }
}
