/// <reference types="node" />
export declare function generateDelegatorEarningsTree(delegators: any): void;
export interface MerkleTree {
    elements: Array<any>;
    layers: Array<any>;
}
export declare class MerkleTree {
    constructor(elements: any);
    getLayers(elements: any): any[];
    getNextLayer(elements: any): any;
    combinedHash(first: any, second: any): any;
    getRoot(): any;
    getHexRoot(): any;
    getProof(el: any): any;
    getHexProof(el: any): any;
    getPairElement(idx: any, layer: any): any;
    bufIndexOf(el: any, arr: any): number;
    bufDedup(elements: any): any;
    bufArrToHexArr(arr: any): any;
    sortAndConcat(...args: any[]): Buffer;
}
export interface EarningsTree extends MerkleTree {
    leaves: Array<string>;
}
export declare class EarningsTree extends MerkleTree {
    constructor(delegators: any);
    static fromJSON(json: string): any;
    toJSON(): string;
}
