"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merkleSnapshot = exports.roundsManager = exports.bondingManager = void 0;
var provider = require('./provider');
var ethers_1 = require("ethers");
var NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
// import contract ABIs 
var BondingManager = require('../../abi/BondingManager.json').abi;
var RoundsManager = require('../../abi/RoundsManager.json').abi;
var MerkleSnapshot = require('../../abi/MerkleSnapshot.json').abi;
var bondingManagerAddress = ethers_1.utils.getAddress(process.env.BONDINGMANAGER_ADDRESS || NULL_ADDRESS);
var roundsManagerAddress = ethers_1.utils.getAddress(process.env.ROUNDSMANAGER_ADDRESS || NULL_ADDRESS);
var merkleSnapshotAddress = ethers_1.utils.getAddress(process.env.MERKLESNAPSHOT_ADDRESS || NULL_ADDRESS);
var createContractInstance = function (address, abi) {
    return new ethers_1.Contract(address, abi, provider);
};
exports.bondingManager = createContractInstance(bondingManagerAddress, BondingManager);
exports.roundsManager = createContractInstance(roundsManagerAddress, RoundsManager);
exports.merkleSnapshot = createContractInstance(merkleSnapshotAddress, MerkleSnapshot);
