#!/usr/bin/env node
"use strict";

require('dotenv').config()

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const program = require('commander');

import {earnings, generate, verify, claim, checkProvider} from './cmd'

clear()
console.log(
  chalk.green(
    figlet.textSync(
      'Livepeer Merkle Earnings',
      {
        font: 'Doom',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        whitespaceBreak: true
    } 
      )
  )
);

(async () => {
  program
	.version('1.O.O')
  .description("Livepeer Earnings Merkle Tree Tool")
  .option('-g, --generate', 'Generate a new Earnings Merkle Tree at the snapshot round')
  .option('-e, --earnings <address>', 'Get earnings for an address up until the snapshot round')
  .option('-ve --verify <address>', 'Verify the merkle tree for an address')
  .option('-c --claim <keystoreFilePath>', 'Claim snapshot earnings')
  .parse(process.argv)
  .outputHelp()

  console.log("\n")

  if (process.env.ETH_RPC == "") {
    console.log('    ',chalk.red.bold("Must define an Ethereum JSON-RPC provider"))
    return
  }

  if (!(await checkProvider())) {
    console.log('    ',chalk.red.bold("Invalid Ethereum JSON-RPC provider"))
    return
  }

  if (program.earnings) {
    await earnings(program.earnings)
  }
  if (program.generate) {
     await generate()
  }
  if (program.verify) {
    await verify(program.verify)
  }
  if (program.claim) {
    await claim(program.claim)
  }
})()