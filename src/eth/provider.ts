import {providers} from 'ethers'

const l1Provider = new providers.JsonRpcProvider(process.env.L1_ETH_RPC)
const l2Provider = new providers.JsonRpcProvider(process.env.L2_ETH_RPC)

module.exports = {
    l1Provider,
    l2Provider
}