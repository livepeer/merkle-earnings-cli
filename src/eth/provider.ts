import {providers} from 'ethers'

const provider = new providers.JsonRpcProvider(process.env.ETH_RPC, "mainnet")

module.exports = provider