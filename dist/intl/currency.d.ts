export declare class Currency {
    constructor(code: string);
    private _code;
    readonly code: string;
    toString(): string;
    toJSON(): any;
    protected fromJSON(json: any): void;
}
