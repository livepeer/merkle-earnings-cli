import  {bondingManager, roundsManager, merkleSnapshot} from './contracts'
import {BigNumber, utils} from 'ethers'
const { createApolloFetch } = require('apollo-fetch');

const fetchSubgraph = createApolloFetch({
    uri: `${process.env.SUBGRAPH_URL}`,
  });

export const getEarnings = async(address:string, endRound: BigNumber): Promise<{delegator: string, pendingStake: BigNumber, pendingFees: BigNumber}> => {
    try {
        const earnings: {delegator: string, pendingStake: BigNumber, pendingFees: BigNumber} = {
            delegator: address,
            pendingStake: await bondingManager.pendingStake(address, endRound, { gasLimit: BigNumber.from("1000000000000000000") }),
            pendingFees: await bondingManager.pendingFees(address, endRound, { gasLimit: BigNumber.from("1000000000000000000") })
        }
        return earnings
    } catch(err) {
        return err
    }
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
                id
              }
            }`,
          })).data.delegators
    
          batch = await Promise.all(batch.map(d => getEarnings(d.id, snapshotRound)))
      
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
            return await roundsManager.lipUpgradeRound(BigNumber.from(36))
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