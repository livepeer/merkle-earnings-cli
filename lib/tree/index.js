"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EarningsTree = exports.MerkleTree = exports.generateDelegatorEarningsTree = void 0;
var _a = require('ethereumjs-util'), keccak256 = _a.keccak256, bufferToHex = _a.bufferToHex;
var ethers_1 = require("ethers");
function generateDelegatorEarningsTree(delegators) {
}
exports.generateDelegatorEarningsTree = generateDelegatorEarningsTree;
var MerkleTree = /** @class */ (function () {
    function MerkleTree(elements) {
        // Filter empty strings and hash elements
        this.elements = elements.filter(function (el) { return el; }).map(function (el) { return keccak256(el); });
        // Deduplicate elements
        this.elements = this.bufDedup(this.elements);
        // Sort elements
        this.elements.sort(Buffer.compare);
        // Create layers
        this.layers = this.getLayers(this.elements);
    }
    MerkleTree.prototype.getLayers = function (elements) {
        if (elements.length === 0) {
            return [['']];
        }
        var layers = [];
        layers.push(elements);
        // Get next layer until we reach the root
        while (layers[layers.length - 1].length > 1) {
            layers.push(this.getNextLayer(layers[layers.length - 1]));
        }
        return layers;
    };
    MerkleTree.prototype.getNextLayer = function (elements) {
        var _this = this;
        return elements.reduce(function (layer, el, idx, arr) {
            if (idx % 2 === 0) {
                // Hash the current element with its pair element
                layer.push(_this.combinedHash(el, arr[idx + 1]));
            }
            return layer;
        }, []);
    };
    MerkleTree.prototype.combinedHash = function (first, second) {
        if (!first) {
            return second;
        }
        if (!second) {
            return first;
        }
        return keccak256(this.sortAndConcat(first, second));
    };
    MerkleTree.prototype.getRoot = function () {
        return this.layers[this.layers.length - 1][0];
    };
    MerkleTree.prototype.getHexRoot = function () {
        return bufferToHex(this.getRoot());
    };
    MerkleTree.prototype.getProof = function (el) {
        var _this = this;
        var idx = this.bufIndexOf(el, this.elements);
        if (idx === -1) {
            throw new Error('Element does not exist in Merkle tree');
        }
        return this.layers.reduce(function (proof, layer) {
            var pairElement = _this.getPairElement(idx, layer);
            if (pairElement) {
                proof.push(pairElement);
            }
            idx = Math.floor(idx / 2);
            return proof;
        }, []);
    };
    MerkleTree.prototype.getHexProof = function (el) {
        var proof = this.getProof(el);
        return this.bufArrToHexArr(proof);
    };
    MerkleTree.prototype.getPairElement = function (idx, layer) {
        var pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
        if (pairIdx < layer.length) {
            return layer[pairIdx];
        }
        else {
            return null;
        }
    };
    MerkleTree.prototype.bufIndexOf = function (el, arr) {
        var hash;
        // Convert element to 32 byte hash if it is not one already
        if (el.length !== 32 || !Buffer.isBuffer(el)) {
            hash = keccak256(el);
        }
        else {
            hash = el;
        }
        for (var i = 0; i < arr.length; i++) {
            if (hash.equals(arr[i])) {
                return i;
            }
        }
        return -1;
    };
    MerkleTree.prototype.bufDedup = function (elements) {
        var _this = this;
        return elements.filter(function (el, idx) {
            return _this.bufIndexOf(el, elements) === idx;
        });
    };
    MerkleTree.prototype.bufArrToHexArr = function (arr) {
        if (arr.some(function (el) { return !Buffer.isBuffer(el); })) {
            throw new Error('Array is not an array of buffers');
        }
        return arr.map(function (el) { return '0x' + el.toString('hex'); });
    };
    MerkleTree.prototype.sortAndConcat = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Buffer.concat(__spreadArrays(args).sort(Buffer.compare));
    };
    return MerkleTree;
}());
exports.MerkleTree = MerkleTree;
var EarningsTree = /** @class */ (function (_super) {
    __extends(EarningsTree, _super);
    function EarningsTree(delegators) {
        var _this = this;
        var leaves = delegators.map(function (d) { return ethers_1.utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [d.delegator, d.pendingStake, d.pendingFees]); });
        _this = _super.call(this, leaves) || this;
        _this.leaves = leaves;
        return _this;
    }
    EarningsTree.fromJSON = function (json) {
        var leaves = JSON.parse(json);
        var thisClass = Object.create(this.prototype);
        // Filter empty strings and hash elements
        var elements = leaves.filter(function (el) { return el; }).map(function (el) { return keccak256(el); });
        // Deduplicate elements
        elements = thisClass.bufDedup(elements);
        // Sort elements
        thisClass.elements = elements.sort(Buffer.compare);
        // Create layers
        thisClass.layers = thisClass.getLayers(elements);
        return thisClass;
    };
    EarningsTree.prototype.toJSON = function () {
        return JSON.stringify(this.leaves);
    };
    return EarningsTree;
}(MerkleTree));
exports.EarningsTree = EarningsTree;
