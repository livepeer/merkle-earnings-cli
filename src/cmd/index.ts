const ora = require("ora")
const cliSpinners = require('cli-spinners')
const chalk = require('chalk')

const fs = require('fs').promises
const path = require('path')
const fsExists = require('fs').existsSync
import {BigNumber, Wallet, utils} from 'ethers'

const {keccak256, bufferToHex} = require("ethereumjs-util")
let abi = require("ethereumjs-abi")

import {getEarnings, getSnapshotRound, getDelegators, getEarningsRoot, verifyEarningsProof} from '../eth/rpc'
import {EarningsTree} from '../tree'
import { pathToFileURL } from 'url'
import { merkleSnapshot, bondingManager } from '../eth/contracts'

const formatEther = (value: BigNumber) => {
    return utils.commify(utils.formatEther(value))
  }

 const oraPromise = async (action: Promise<any>, options: {}) => {
	// eslint-disable-next-line promise/prefer-await-to-then
	if (typeof action.then !== 'function') {
		throw new TypeError('Parameter `action` must be a Promise');
	}

	const spinner = ora(options)
	spinner.start();

		try {
			let returnVal = await action;
            spinner.succeed();
            return returnVal
		} catch (err) {
            console.log(err)
            spinner.fail();
        }

};

export async function earnings(address:string) {
    let spinner = ora(cliSpinners.dots).start()
    spinner.text = "Fetching Earnings"
    spinner.indent = 2
    if (!utils.isAddress(address)) {
      spinner.fail()
      console.log("\n")
      console.log(chalk.red(address), "is not a valid Ethereum address")
      console.log("\n")
      return
    }

    try {
      const endRound = await getSnapshotRound()
      const earnings = await getEarnings(address, endRound)
      spinner.succeed()
      console.log("\n")
  
      console.log(chalk.green.bold(address))
      console.log("Pending Stake:", formatEther(earnings.pendingStake), "LPT")
      console.log("Pending Fees:", formatEther(earnings.pendingFees), "ETH")
  
      console.log("\n")
      return earnings
    } catch(err) {
      spinner.fail()
      console.log("\n")
      console.log(err.toString())
      console.log("\n")
    }
}

export async function generate() {
    try {
        const round = await getSnapshotRound()
        let delegators = await oraPromise(getDelegators(), {text: "Fetching all delegators, this might take a while...", indent: 2})
        if (!delegators) return;
        delegators = delegators.filter(d => d.delegator != "0x0000000000000000000000000000000000000000" || d.delegator)
        console.log(delegators[0], delegators[1])
        console.log("del length", delegators.length)
        // generate merkle tree
        const treeSpinner = ora({text: "Generating Merkle Tree", indent: 2}).start()
        // const leaves = delegators.map(d => utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [d.delegator, d.pendingStake, d.pendingFees]))
        // console.log(leaves)
        // const tree = new MerkleTree(leaves)
        const tree = new EarningsTree(delegators)
        if (!tree) {
            treeSpinner.fail()
            return
        }
        treeSpinner.succeed()

        await oraPromise(fs.writeFile('earningsTree.JSON', tree.toJSON()), {text: "Writing leaves to JSON", indent: 2})

        console.log("\n")
        console.log(chalk.green.bold("Merkle Root:"), tree.getHexRoot())
        return tree
    } catch(err) {
        console.log(err)
    }
}

async function reconstructTree():Promise<EarningsTree|undefined> {
    let tree:EarningsTree|undefined
    if (fsExists('earningsTree.JSON')) {
        let jsonSpinner = ora({text: "Generating merkle tree from JSON file", indent: 2}).start()
        try {
            const jsonFile = await fs.readFile("earningsTree.JSON")
            tree = EarningsTree.fromJSON(jsonFile)
            jsonSpinner.succeed()
        } catch(err) {
            jsonSpinner.fail()
            return
        }
    } else {
        ora({text: "No JSON file found, generating merkle tree", indent: 2}).start().info()
       tree = await generate()
       if (!tree) {
           return
       }
    }
}
export async function verify(address:string) {
        // Get and log the earnings for an address
        const snapshotEarnings = await earnings(address)

        // reconstruct tree
        const tree = await reconstructTree()

        // compare on chain merkle root with generated merkle root
        let validateRootSpinner = ora({text: "Validating on-chain merkle root", indent: 2}).start()
        const onChainRoot = await getEarningsRoot()
        const localRoot = tree?.getHexRoot()
        if (localRoot != onChainRoot) {
            validateRootSpinner.fail()
            return
        }
        validateRootSpinner.succeed()
        console.log("\n")
        console.log(`On-chain Merkle Root: ${onChainRoot}`)
        console.log(`Local Merkle Root: ${localRoot}`)
        console.log("\n")

        let proofSpinner = ora({text: "Generating merkle proof", indent: 2}).start()
        const leaf = utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [snapshotEarnings?.delegator, snapshotEarnings?.pendingStake, snapshotEarnings?.pendingFees])
        const proof = tree?.getHexProof(leaf)
        if (!proof) {
            proofSpinner.fail()
            return
        }
        proofSpinner.succeed()
        console.log("\n", chalk.green.bold(`Merkle Proof for ${address}:`, proof))

        // Validate proof on chain 
        await oraPromise(verifyEarningsProof(proof, utils.keccak256(leaf)), {text:"Verifying merkle proof on-chain", indent: 2})
}

export async function claim(keystoreFile, password) {
    let walletSpinner = ora({text: "Reading wallet file", indent: 2}).start()
    if (!path.isAbsolute(keystoreFile)) {
        console.log(chalk.red("Path to keystore file must be absolute"))
        walletSpinner.fail()
        return
    }
    let keystore
    try {
        keystore = await fs.readFile(keystoreFile)
    } catch(err) {
        walletSpinner.fail()
        return
    }
    walletSpinner.succeed()

    const wallet = await oraPromise(Wallet.fromEncryptedJson(keystore, password), {text: "Decrypting wallet", indent: 2})

    wallet.connect(bondingManager.provider)
    bondingManager.connect(wallet)

    // get earnings
    const snapshotEarnings = await earnings(wallet.address)
    const leaf = utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [snapshotEarnings?.delegator, snapshotEarnings?.pendingStake, snapshotEarnings?.pendingFees])

    // reconstruct tree 
    const tree = await reconstructTree()
    const proof = tree?.getHexProof(leaf)

    // verify proof for leaf
    if (!await oraPromise(verifyEarningsProof(proof, utils.keccak256(leaf)), {text:"Verifying merkle proof on-chain", indent: 2})) return 

    // submit claim transaction
    await oraPromise(
        bondingManager.claimSnapshotEarnings(snapshotEarnings?.pendingStake, snapshotEarnings?.pendingFees, proof, []),
        {text: "claiming snapshot earnings", indent: 2}
    )
}