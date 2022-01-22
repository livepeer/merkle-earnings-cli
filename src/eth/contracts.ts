const { l1Provider, l2Provider } = require('./provider')
import {ethers, Contract, utils} from 'ethers'

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000"
// import contract ABIs 
const BondingManager = require('../../abi/BondingManager.json').abi
const MerkleSnapshot = require('../../abi/MerkleSnapshot.json').abi

const bondingManagerAddress = utils.getAddress(process.env.BONDINGMANAGER_ADDRESS || NULL_ADDRESS)
const merkleSnapshotAddress = utils.getAddress(process.env.MERKLESNAPSHOT_ADDRESS || NULL_ADDRESS)

const createContractInstance = (address:string, abi:ethers.ContractInterface, provider:ethers.providers.Provider):ethers.Contract => {
    return new Contract(address, abi, provider)
}

export const bondingManager = createContractInstance(bondingManagerAddress, BondingManager, l1Provider)
export const merkleSnapshot = createContractInstance(merkleSnapshotAddress, MerkleSnapshot, l2Provider)
