import  {bondingManager, merkleSnapshot} from './contracts'
import {BigNumber, utils} from 'ethers'
const { createApolloFetch } = require('apollo-fetch');
const { l1Provider } = require('./provider')

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
    } catch(err: any) {
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
    return (await l1Provider.getCode(address)) === "0x"
}

const isOrchestrator = (item) => {
    return item.id === item.delegate.id;
}

const filterAddresses = async (arr) => {
    // remove orchestrators
    const noOrchs = arr.filter(item => !isOrchestrator(item))

    // remove contract accounts
    const results = await Promise.all(
        noOrchs.map(item => isEOA(item.id))
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
    } catch(err: any) {
        return err
    }
  }
  
export async function getSnapshotRound ():Promise<BigNumber> {
    return BigNumber.from(process.env.SNAPSHOT_ROUND)
}

export async function getEarningsRoot(LIP: string) {
    try {
        return await merkleSnapshot.snapshot(utils.keccak256(utils.toUtf8Bytes(LIP)))
    } catch(err) {
        return err
    }
}

export async function verifyEarningsProof(LIP: string, proof, leaf) {
    try {
        const id = utils.keccak256(utils.toUtf8Bytes(LIP))
        return await merkleSnapshot.verify(id, proof, leaf)
    } catch(err) {
        return err
    }
}