import { BigNumber } from 'ethers';
import { EarningsTree } from '../tree';
export declare function earnings(address: string): Promise<{
    delegator: string;
    pendingStake: BigNumber;
    pendingFees: BigNumber;
} | undefined>;
export declare function generate(): Promise<EarningsTree | undefined>;
export declare function verify(address: string): Promise<void>;
export declare function claimSnapshotEarnings(keystore: any, password: any): Promise<void>;
