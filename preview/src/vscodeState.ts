export interface VSCodeState {
    readonly gifUrl: string;
    readonly frame: number;
    readonly playing: boolean;
}

export function getVSCodeState(vscode: any): VSCodeState | undefined {
    return vscode.getState();
}

export function setVSCodeState(vscode: any, newState: VSCodeState): VSCodeState | undefined {
    return vscode.setState(newState);
}