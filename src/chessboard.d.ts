declare interface ChessboardConfig {
    onDrop?: Function;
    draggable?: boolean;
    onChange?: Function;
    onMoveEnd?: Function;
    onSnapEnd?: Function;
    sparePieces?: boolean;
    onDragMove?: Function;
    showNotation?: boolean;
    onDragStart?: Function;
    onSnapbackEnd?: Function;
    onMouseoutSquare?: Function;
    onMouseoverSquare?: Function;
    pieceTheme?: string | Function;
    orientation?: ChessboardTypes.OrientationType;
    showErrors?: boolean | string | Function;
    moveSpeed?: number | ChessboardTypes.SpeedType;
    snapSpeed?: number | ChessboardTypes.SpeedType;
    trashSpeed?: number | ChessboardTypes.SpeedType;
    dropOffBoard?: ChessboardTypes.DropOffBoardType;
    appearSpeed?: number | ChessboardTypes.SpeedType;
    snapbackSpeed?: number | ChessboardTypes.SpeedType;
    position?: ChessboardTypes.PositionType | string | object;
}

declare namespace ChessboardTypes {
    type PositionType = 'start';
    type PositionFenType = 'fen';
    type SpeedType = 'slow' | 'fast';
    type OrientationFlipType = 'flip';
    type OrientationType = 'white' | 'black';
    type DropOffBoardType = 'snapback' | 'trash';
}

declare class Chessboard {
    constructor(elementId: string, cfg: ChessboardConfig);
    constructor(elementId: string);
    constructor();
    clear(useAnimation?: boolean): void;
    destroy(): void;
    fen(): string;
    flip(): void;
    move(...args: string[]): object; // *FIND RETURN*
    position(newPosition: object | string | ChessboardTypes.PositionType, useAnimation?: boolean): void
    position(fen?: ChessboardTypes.PositionFenType): string | object;
    orientation(side?: ChessboardTypes.OrientationType | ChessboardTypes.OrientationFlipType): string;
    resize(): void;
    start(useAnimation?: boolean): void;
}
