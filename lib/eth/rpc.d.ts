import { BigNumber } from 'ethers';
export declare const getEarnings: (address: string, endRound: BigNumber) => Promise<{
    delegator: string;
    pendingStake: BigNumber;
    pendingFees: BigNumber;
}>;
export declare const getDelegators: () => Promise<Array<string>>;
export declare function getSnapshotRound(): Promise<BigNumber>;
export declare function getEarningsRoot(): Promise<any>;
export declare function verifyEarningsProof(proof: any, leaf: any): Promise<any>;
