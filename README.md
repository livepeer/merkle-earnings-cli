# Merkle Earnings CLI

```
 _     _                                 ___  ___          _    _        _____                 _
| |   (_)                                |  \/  |         | |  | |      |  ___|               (_)
| |    ___   _____ _ __   ___  ___ _ __  | .  . | ___ _ __| | _| | ___  | |__  __ _ _ __ _ __  _ _ __   __ _ ___
| |   | \ \ / / _ \ '_ \ / _ \/ _ \ '__| | |\/| |/ _ \ '__| |/ / |/ _ \ |  __|/ _` | '__| '_ \| | '_ \ / _` / __|
| |___| |\ V /  __/ |_) |  __/  __/ |    | |  | |  __/ |  |   <| |  __/ | |__| (_| | |  | | | | | | | | (_| \__ \
\_____/_| \_/ \___| .__/ \___|\___|_|    \_|  |_/\___|_|  |_|\_\_|\___| \____/\__,_|_|  |_| |_|_|_| |_|\__, |___/
                  | |                                                                                   __/ |
                  |_|                                                                                  |___/
Usage: mearnings [options]

Livepeer Earnings Merkle Tree Tool

Options:
  -V, --version                         output the version number
  -g, --generate                        Generate a new Earnings Merkle Tree at the snapshot round
  -e, --earnings <address>              Get earnings for an address up until the snapshot round
  -ve --verify <address>                Verify the merkle tree for an address
  -c --claim <keystoreFile>             Claim snapshot earnings
  -h, --help
```

## Install

```
$ npm install
```

## Build

```
$ npm run build && npm i -g
```

If you run into permissioning errors using `sudo npm i -g` can provide a shortcut without having to alter npm permissioning.

## Run 
```
$ mearnings [options]
```

## Usage 

### `mearnings --help` 

Lists usage options 

### `mearnings -g`

Generates a new earnings Merkle Tree at the snapshot round (using `.env` or using the snapshot round stored on-chain)

### `mearnings -e <address>`

Gets the `pendingStake` and `pendingFees` for an address at the snapshot round. This will be the previous stake and fees plus any subsequent earnings since the last claim round. 

`<address>` = your (or an) Ethereum address

### `mearnings -ve <address>`

Verifies that an address and its earnings are part of the Merkle tree. This requires a local merkle tree (`earningsTree.JSON` to be present in the root of the folder) to generate the necessary proofs that are then verified on-chain. 

### `mearnings -c <keystoreFile>`

Claims earnings using the snapshot mechanic up until the snapshot round. Requires the path to your keystore file as an argument after which you will be prompted for your password. 

This requires a local merkle tree (`earningsTree.JSON` to be present in the root of the folder) to generate the necessary proofs that are then verified on-chain. 

## FAQ 

- Where can I find more information about this tool? 

Please check [this Livepeer forum post](https://forum.livepeer.org/t/lip-52-verify-the-snapshot-for-yourself/1153)

- What if there is no `earningsTree.JSON`file in the root folder? 

Either pull down the latest master branch which will include this or generate it yourself (for the snapshot round) using `mearnings -g`. 
