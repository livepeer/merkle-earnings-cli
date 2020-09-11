"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var provider = new ethers_1.providers.JsonRpcProvider(process.env.ETH_RPC, "mainnet");
module.exports = provider;
