import  {bondingManager, roundsManager, merkleSnapshot} from './contracts'
import {BigNumber, utils} from 'ethers'
const { createApolloFetch } = require('apollo-fetch');
const provider = require('./provider')

const fetchSubgraph = createApolloFetch({
    uri: `${process.env.SUBGRAPH_URL}`,
  });

export const getEarnings = async(address:string, endRound: BigNumber): Promise<{delegator: string, pendingStake: BigNumber, pendingFees: BigNumber}> => {
    const [pendingStake, pendingFees] = await Promise.all([
        bondingManager.pendingStake(address, endRound, { gasLimit: BigNumber.from("1000000000000000000") }),
        bondingManager.pendingFees(address, endRound, { gasLimit: BigNumber.from("1000000000000000000") })
    ])
    
    try {
        const earnings: {delegator: string, pendingStake: BigNumber, pendingFees: BigNumber} = {
            delegator: address,
            pendingStake,
            pendingFees
        }
        return earnings
    } catch(err) {
        return err
    }
}

const getDelegatorSnapshot = async (
    delegator: string,
    delegate: string,
    snapshotRound: BigNumber,
) => {
  const earnings = await getEarnings(delegator, snapshotRound);
  return {
    ...earnings,
    delegate,
  };
};
const isEOA = async (address: string) => {
    return provider.getCode(address) === "0x"
}

const isOrchestrator = async (item) => {
    return item.id === item.delegate.id;
}

const filterAddresses = async (arr) => {
    const results = await Promise.all(
        arr.map(item => (isEOA(item.id) || !isOrchestrator(item)))
    );
    return arr.filter((_v, index) => results[index]);
}

export const getDelegators = async ():Promise<Array<string>> => {
    try {
        let snapshotRound = await getSnapshotRound()
        let delegators: Array<string> = []
        let batchLength
        do {
          let batch = (await fetchSubgraph({
            query: `{
              delegators(skip: ${delegators.length}, where:{ bondedAmount_not: 0 }) {
                id,
                delegate {
                    id
                }
              }
            }`,
          })).data.delegators
    
          
          const filteredBatch = await filterAddresses(batch)
          batch = await Promise.all(filteredBatch.map(d => getDelegatorSnapshot(d.id, d.delegate.id, snapshotRound)))
      
          batchLength = batch.length 
          delegators.push(...batch)
          // throttle to not timeout
          setTimeout(() => {}, 1000)
        } while(batchLength == 100)
        return delegators
    } catch(err) {
        return err
    }
  }
  
export async function getSnapshotRound ():Promise<BigNumber> {
    try {
        if (process.env.SNAPSHOT_ROUND != "") {
            return BigNumber.from(process.env.SNAPSHOT_ROUND)
        } else {
            return await roundsManager.lipUpgradeRound(BigNumber.from(52))
        }
    } catch (err) {
        return err
    }
}

export async function getEarningsRoot() {
    try {
        return await merkleSnapshot.snapshot(utils.keccak256(utils.toUtf8Bytes("LIP-52")))
    } catch(err) {
        return err
    }
}

export async function verifyEarningsProof(proof, leaf) {
    try {
        const id = utils.keccak256(utils.toUtf8Bytes("LIP-52"))
        return await merkleSnapshot.verify(id, proof, leaf)
    } catch(err) {
        return err
    }
}