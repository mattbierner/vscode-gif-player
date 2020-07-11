import { Gif } from './util/loadGif';

export enum AppStage {
    Loading,
    Errored,
    Ready
};

export class Loading {
    public readonly stage = AppStage.Loading;
}

export class Errored {
    public readonly stage = AppStage.Errored;

    constructor(
        public readonly error: string
    ) { }
}

export class Ready {
    public readonly stage = AppStage.Ready;

    constructor(
        public readonly gif: Gif,
        public readonly frame: number,
        public readonly playing: boolean,
    ) { }
}

export type AppState = Loading | Errored | Ready;