"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimSnapshotEarnings = exports.verify = exports.generate = exports.earnings = void 0;
var ora = require("ora");
var cliSpinners = require('cli-spinners');
var chalk = require('chalk');
var fs = require('fs').promises;
var fsExists = require('fs').existsSync;
var ethers_1 = require("ethers");
var _a = require("ethereumjs-util"), keccak256 = _a.keccak256, bufferToHex = _a.bufferToHex;
var abi = require("ethereumjs-abi");
var rpc_1 = require("../eth/rpc");
var tree_1 = require("../tree");
var formatEther = function (value) {
    return ethers_1.utils.commify(ethers_1.utils.formatEther(value));
};
var oraPromise = function (action, options) { return __awaiter(void 0, void 0, void 0, function () {
    var spinner, returnVal, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // eslint-disable-next-line promise/prefer-await-to-then
                if (typeof action.then !== 'function') {
                    throw new TypeError('Parameter `action` must be a Promise');
                }
                spinner = ora(options);
                spinner.start();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, action];
            case 2:
                returnVal = _a.sent();
                spinner.succeed();
                return [2 /*return*/, returnVal];
            case 3:
                err_1 = _a.sent();
                console.log(err_1);
                spinner.fail();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
function earnings(address) {
    return __awaiter(this, void 0, void 0, function () {
        var spinner, endRound, earnings_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    spinner = ora(cliSpinners.dots).start();
                    spinner.text = "Fetching Earnings";
                    spinner.indent = 2;
                    if (!ethers_1.utils.isAddress(address)) {
                        spinner.fail();
                        console.log("\n");
                        console.log(chalk.red(address), "is not a valid Ethereum address");
                        console.log("\n");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, rpc_1.getSnapshotRound()];
                case 2:
                    endRound = _a.sent();
                    return [4 /*yield*/, rpc_1.getEarnings(address, endRound)];
                case 3:
                    earnings_1 = _a.sent();
                    spinner.succeed();
                    console.log("\n");
                    console.log(chalk.green.bold(address));
                    console.log("Pending Stake:", formatEther(earnings_1.pendingStake), "LPT");
                    console.log("Pending Fees:", formatEther(earnings_1.pendingFees), "ETH");
                    console.log("\n");
                    return [2 /*return*/, earnings_1];
                case 4:
                    err_2 = _a.sent();
                    spinner.fail();
                    console.log("\n");
                    console.log(err_2.toString());
                    console.log("\n");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.earnings = earnings;
function generate() {
    return __awaiter(this, void 0, void 0, function () {
        var round, delegators, treeSpinner, tree, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, rpc_1.getSnapshotRound()];
                case 1:
                    round = _a.sent();
                    return [4 /*yield*/, oraPromise(rpc_1.getDelegators(), { text: "Fetching all delegators, this might take a while...", indent: 2 })];
                case 2:
                    delegators = _a.sent();
                    if (!delegators)
                        return [2 /*return*/];
                    delegators = delegators.filter(function (d) { return d.delegator != "0x0000000000000000000000000000000000000000" || d.delegator; });
                    console.log(delegators[0], delegators[1]);
                    console.log("del length", delegators.length);
                    treeSpinner = ora({ text: "Generating Merkle Tree", indent: 2 }).start();
                    tree = new tree_1.EarningsTree(delegators);
                    if (!tree) {
                        treeSpinner.fail();
                        return [2 /*return*/];
                    }
                    treeSpinner.succeed();
                    return [4 /*yield*/, oraPromise(fs.writeFile('earningsTree.JSON', tree.toJSON()), { text: "Writing leaves to JSON", indent: 2 })];
                case 3:
                    _a.sent();
                    console.log("\n");
                    console.log(chalk.green.bold("Merkle Root:"), tree.getHexRoot());
                    return [2 /*return*/, tree];
                case 4:
                    err_3 = _a.sent();
                    console.log(err_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.generate = generate;
function verify(address) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshotEarnings, tree, jsonSpinner, jsonFile, err_4, validateRootSpinner, onChainRoot, localRoot, proofSpinner, leaf, proof;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, earnings(address)
                    // fetch JSON File , if it doesn't exist generate it or get it from IPFS
                ];
                case 1:
                    snapshotEarnings = _a.sent();
                    if (!fsExists('earningsTree.JSON')) return [3 /*break*/, 6];
                    jsonSpinner = ora({ text: "Generating merkle tree from JSON file", indent: 2 }).start();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readFile("earningsTree.JSON")];
                case 3:
                    jsonFile = _a.sent();
                    tree = tree_1.EarningsTree.fromJSON(jsonFile);
                    jsonSpinner.succeed();
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    jsonSpinner.fail();
                    return [2 /*return*/];
                case 5: return [3 /*break*/, 8];
                case 6:
                    ora({ text: "No JSON file found, generating merkle tree", indent: 2 }).start().info();
                    return [4 /*yield*/, generate()];
                case 7:
                    tree = _a.sent();
                    if (!tree) {
                        return [2 /*return*/];
                    }
                    _a.label = 8;
                case 8:
                    validateRootSpinner = ora({ text: "Validating on-chain merkle root", indent: 2 }).start();
                    return [4 /*yield*/, rpc_1.getEarningsRoot()];
                case 9:
                    onChainRoot = _a.sent();
                    localRoot = tree === null || tree === void 0 ? void 0 : tree.getHexRoot();
                    if (localRoot != onChainRoot) {
                        validateRootSpinner.fail();
                        return [2 /*return*/];
                    }
                    validateRootSpinner.succeed();
                    console.log("\n");
                    console.log("On-chain Merkle Root: " + onChainRoot);
                    console.log("Local Merkle Root: " + localRoot);
                    console.log("\n");
                    proofSpinner = ora({ text: "Generating merkle proof", indent: 2 }).start();
                    leaf = ethers_1.utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [snapshotEarnings === null || snapshotEarnings === void 0 ? void 0 : snapshotEarnings.delegator, snapshotEarnings === null || snapshotEarnings === void 0 ? void 0 : snapshotEarnings.pendingStake, snapshotEarnings === null || snapshotEarnings === void 0 ? void 0 : snapshotEarnings.pendingFees]);
                    proof = tree === null || tree === void 0 ? void 0 : tree.getHexProof(leaf);
                    if (!proof) {
                        proofSpinner.fail();
                        return [2 /*return*/];
                    }
                    proofSpinner.succeed();
                    console.log("\n", chalk.green.bold("Merkle Proof for " + address + ":", proof));
                    // Validate proof on chain 
                    return [4 /*yield*/, oraPromise(rpc_1.verifyEarningsProof(proof, ethers_1.utils.keccak256(leaf)), { text: "Verifying merkle proof on-chain", indent: 2 })];
                case 10:
                    // Validate proof on chain 
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.verify = verify;
function claimSnapshotEarnings(keystore, password) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log(keystore, password);
            return [2 /*return*/];
        });
    });
}
exports.claimSnapshotEarnings = claimSnapshotEarnings;
