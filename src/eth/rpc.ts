import  {bondingManager, merkleSnapshot} from './contracts'
import {BigNumber, constants, utils} from 'ethers'
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

export const getDelegatorSnapshot = async (
    delegator: string,
    snapshotRound: BigNumber
) => {
    const delegate = (await bondingManager.getDelegator(delegator)).delegateAddress
    return await getDelegatorSnapshotWithDelegate(delegator, delegate, snapshotRound)
}

const getDelegatorSnapshotWithDelegate = async (
    delegator: string,
    delegate: string,
    snapshotRound: BigNumber,
) => {
  const earnings = await getEarnings(delegator, snapshotRound);
  return {
    ...earnings,
    // delegate could be null
    delegate: delegate ? delegate : constants.AddressZero,
  };
};

const isEOA = async (address: string) => {
    return (await l1Provider.getCode(address)) === "0x"
}

const isOrchestrator = (item) => {
    // delegate could be null
    return item.id === item.delegate?.id;
}

const filterAddresses = async (arr) => {
    // remove orchestrators
    const noOrchs = arr.filter(item => !isOrchestrator(item))

    // remove contract accounts
    const results = await Promise.all(
        noOrchs.map(item => isEOA(item.id))
    );
    return noOrchs.filter((_v, index) => results[index]);
}

export const getDelegators = async ():Promise<Array<string>> => {
    try {
        let snapshotRound = await getSnapshotRound()
        let delegators: Array<string> = []
        let batchLength
        let skip = 0
        do {
          let batch = (await fetchSubgraph({
            query: `{
              delegators(skip: ${skip}) {
                id,
                delegate {
                    id
                }
              }
            }`,
          })).data.delegators

          // Get # delegators returned in subgraph response before filtering
          batchLength = batch.length
          skip += batchLength

          const filteredBatch = await filterAddresses(batch)
          batch = await Promise.all(filteredBatch.map(d => getDelegatorSnapshotWithDelegate(d.id, d.delegate?.id, snapshotRound)))
      
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