const ora = require("ora")
const cliSpinners = require('cli-spinners')
const chalk = require('chalk')
const prompt = require("prompt-sync")()
const fs = require('fs').promises
const path = require('path')
const fsExists = require('fs').existsSync
import {BigNumber, Wallet, utils} from 'ethers'

import {getDelegatorSnapshot, getSnapshotRound, getDelegators, getEarningsRoot, verifyEarningsProof} from '../eth/rpc'
import {EarningsTree} from '../tree'
import { bondingManager } from '../eth/contracts'
const { l1Provider, l2Provider } = require('../eth/provider')


const formatEther = (value: BigNumber) => {
    return utils.commify(utils.formatEther(value))
  }

function promptUserInput(): string {
    let input = prompt("Enter LIP version. eg: 'LIP-73': ");
    // matches string LIP-0 to LIP-999
    if(!input.match("^LIP-[0-9][0-9]{0,2}$")) {
        console.log("Incorrect Input: please enter in this format 'LIP-XXX'\n");
        input = promptUserInput()
    }
    return input
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
      const snapshot = await getDelegatorSnapshot(address, endRound)
      spinner.succeed()
      console.log("\n")
  
      console.log('    ', chalk.green.bold(address))
      console.log('        ', "Delegate:", snapshot.delegate)
      console.log('        ', "Pending Stake:", formatEther(snapshot.pendingStake), "LPT")
      console.log('        ', "Pending Fees:", formatEther(snapshot.pendingFees), "ETH")
  
      console.log("\n")
      return snapshot 
    } catch(err: any) {
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
        console.log("\n")
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
            return tree
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

async function compareRoots(LIP: string, tree: EarningsTree|undefined) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!tree) {
                reject("Tree is undefined")
            }
            const onChainRoot = await getEarningsRoot(LIP)
            const localRoot = tree?.getHexRoot()
            if (localRoot != onChainRoot) {
                reject("roots don't match")
            }
            resolve({onChainRoot, localRoot})
        } catch (err) {
            reject(err)
        }
    })
}

async function generateProof(tree, leaf) {
    return new Promise((resolve, reject) => {
        const proof = tree?.getHexProof(leaf)
        if (!proof) {
           reject()
        }
        resolve(proof)
    })
}

export async function verify(address:string) {
        // Get and log the earnings for an address
        const snapshotEarnings = await earnings(address)

        // reconstruct tree
        let LIP = promptUserInput();
        
        const tree = await reconstructTree()

        const roots = await oraPromise(compareRoots(LIP, tree), {text: "Validating on-chain merkle root", indent: 2})
        console.log("\n")
        console.log('    ',chalk.green.bold("On-chain Merkle Root:"), `${roots.onChainRoot}`)
        console.log('    ', chalk.green.bold("Local Merkle Root:"), `${roots.localRoot}`)
        console.log("\n")

        // get leaf
        const leaf = utils.solidityPack(["address", "address", "uint256", "uint256"], [snapshotEarnings?.delegator, snapshotEarnings?.delegate, snapshotEarnings?.pendingStake, snapshotEarnings?.pendingFees])

        // get proof
        const proof = await oraPromise(generateProof(tree, leaf), {text: "Generating merkle proof", indent: 2})
        console.log('\n')
        console.log('    ',chalk.green.bold(`Merkle Proof for ${address}:`), proof)
        console.log('\n')

        // Validate proof on chain 
        await oraPromise(verifyEarningsProof(LIP, proof, utils.keccak256(utils.arrayify(leaf))), {text:"Verifying merkle proof on-chain", indent: 2})
}

export async function claim(keystoreFile) {
    let walletSpinner = ora({text: "Reading keystore file", indent: 2}).start()
    keystoreFile = path.resolve(__dirname, keystoreFile)
    console.log('    ',chalk.green.bold("Using keystore file:"), keystoreFile)
    let keystore
    try {
        keystore = await fs.readFile(keystoreFile)
    } catch(err) {
        walletSpinner.fail()
        return
    }

    console.log('    ', chalk.green.bold("Please unlock your account"))
    const password = prompt("Password: ", { echo: "" })
    walletSpinner.succeed()

    const wallet = await oraPromise(Wallet.fromEncryptedJson(keystore.toString(), password), {text: "Decrypting wallet", indent: 2})

    const walletWithProvider = wallet.connect(bondingManager.provider)
    let bondingManagerWithSigner = bondingManager.connect(walletWithProvider)
    
    // get earnings
    const snapshotEarnings = await earnings(wallet.address)

    // get leaf
    const leaf = utils.solidityPack(["address", "uint256", "uint256"], [snapshotEarnings?.delegator, snapshotEarnings?.pendingStake, snapshotEarnings?.pendingFees])

    // reconstruct tree 
    let LIP = promptUserInput();

    const tree = await reconstructTree()

    const roots = await oraPromise(compareRoots(LIP, tree), {text: "Validating on-chain merkle root", indent: 2})
    console.log("\n")
    console.log('    ',chalk.green.bold("On-chain Merkle Root:"), `${roots.onChainRoot}`)
    console.log('    ', chalk.green.bold("Local Merkle Root:"), `${roots.localRoot}`)
    console.log("\n")

    // get proof
    const proof = await oraPromise(generateProof(tree, leaf), {text: "Generating merkle proof", indent: 2})
    console.log('\n')
    console.log('    ',chalk.green.bold(`Merkle Proof for ${wallet.address}:`), proof)
    console.log('\n')

    // validate proof on chain
    if (!await oraPromise(verifyEarningsProof(LIP, proof, utils.keccak256(utils.arrayify(leaf))), {text:"Verifying merkle proof on-chain", indent: 2})) return 

    // submit claim transaction
    await oraPromise(
        bondingManagerWithSigner.claimSnapshotEarnings(snapshotEarnings?.pendingStake, snapshotEarnings?.pendingFees, proof, []),
        {text: "claiming snapshot earnings", indent: 2}
    )
}

export async function checkProvider() {
    try {
        await l1Provider.getNetwork()
        await l2Provider.getNetwork()
        return true
    } catch (err) {
        return false
    }
}