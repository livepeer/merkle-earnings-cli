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
exports.verifyEarningsProof = exports.getEarningsRoot = exports.getSnapshotRound = exports.getDelegators = exports.getEarnings = void 0;
var contracts_1 = require("./contracts");
var ethers_1 = require("ethers");
var createApolloFetch = require('apollo-fetch').createApolloFetch;
var fetchSubgraph = createApolloFetch({
    uri: "https://api.thegraph.com/subgraphs/name/livepeer/livepeer",
});
exports.getEarnings = function (address, endRound) { return __awaiter(void 0, void 0, void 0, function () {
    var earnings, err_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = {
                    delegator: address
                };
                return [4 /*yield*/, contracts_1.bondingManager.pendingStake(address, endRound, { gasLimit: ethers_1.BigNumber.from("1000000000000000000") })];
            case 1:
                _a.pendingStake = _b.sent();
                return [4 /*yield*/, contracts_1.bondingManager.pendingFees(address, endRound, { gasLimit: ethers_1.BigNumber.from("1000000000000000000") })];
            case 2:
                earnings = (_a.pendingFees = _b.sent(),
                    _a);
                return [2 /*return*/, earnings];
            case 3:
                err_1 = _b.sent();
                console.log(err_1);
                return [2 /*return*/, err_1];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getDelegators = function () { return __awaiter(void 0, void 0, void 0, function () {
    var snapshotRound_1, delegators, batchLength, batch, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                return [4 /*yield*/, getSnapshotRound()];
            case 1:
                snapshotRound_1 = _a.sent();
                delegators = [];
                batchLength = void 0;
                _a.label = 2;
            case 2: return [4 /*yield*/, fetchSubgraph({
                    query: "{\n              delegators(skip: " + delegators.length + ", where:{ bondedAmount_not: 0 }) {\n                id\n              }\n            }",
                })];
            case 3:
                batch = (_a.sent()).data.delegators;
                return [4 /*yield*/, Promise.all(batch.map(function (d) { return exports.getEarnings(d.id, snapshotRound_1); }))];
            case 4:
                batch = _a.sent();
                batchLength = batch.length;
                delegators.push.apply(delegators, batch);
                // throttle to not timeout
                setTimeout(function () { }, 1000);
                _a.label = 5;
            case 5:
                if (batchLength == 100) return [3 /*break*/, 2];
                _a.label = 6;
            case 6: return [2 /*return*/, delegators];
            case 7:
                err_2 = _a.sent();
                return [2 /*return*/, err_2];
            case 8: return [2 /*return*/];
        }
    });
}); };
function getSnapshotRound() {
    return __awaiter(this, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!process.env.SNAPSHOT_ROUND) return [3 /*break*/, 1];
                    return [2 /*return*/, ethers_1.BigNumber.from(process.env.SNAPSHOT_ROUND)];
                case 1: return [4 /*yield*/, contracts_1.roundsManager.LIPUpgradeRound(36)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    return [2 /*return*/, err_3];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getSnapshotRound = getSnapshotRound;
function getEarningsRoot() {
    return __awaiter(this, void 0, void 0, function () {
        var err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, contracts_1.merkleSnapshot.snapshot(ethers_1.utils.keccak256("LIP-52"))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    err_4 = _a.sent();
                    return [2 /*return*/, err_4];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getEarningsRoot = getEarningsRoot;
function verifyEarningsProof(proof, leaf) {
    return __awaiter(this, void 0, void 0, function () {
        var err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, contracts_1.merkleSnapshot.verify(ethers_1.utils.keccak256("LIP-52"), proof, leaf)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    err_5 = _a.sent();
                    return [2 /*return*/, err_5];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.verifyEarningsProof = verifyEarningsProof;
