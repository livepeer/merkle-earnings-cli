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

You will need to set the following environment variables in the `.env` file in this directory:

- `L1_RPC_URL`: The URL for a L1 Ethereum Mainnet JSON-RPC provider.
- `L2_RPC_URL`: THe URL for a L2 Arbitrum One Mainnet JSON-RPC provider.

```
$ mearnings [options]
```

To list usage options:

```
$ mearnings --help
```

## Usage 

There will be a prompt for a LIP number for the following commands. You can enter LIP-73.

### Generate the snapshot Merkle Tree

`mearnings -g`

Generates a new earnings Merkle Tree at the L1 snapshot round. The root of this snapshot Merkle Tree will be printed.

### Fetch the earnings (pending stake and pending fees) of an address

`mearnings -e <address>`

- `<address>` is an ETH address that you want to fetch earnings for

Fetches the `pendingStake` (the stake of the address plus any rewards) and `pendingFees` (the fees of the address that have not been withdrawn) for an address at the L1 snapshot round. 

### Verify that an address is included in the snapshot Merkle Tree

`mearnings -ve <address>`

- `<address>` is an ETH address that you want to verify is included in the snapshot Merkle tree

Verifies that an address and its earnings are included in the snapshot Merkle tree. This command will use the leaves of the snapshot Merkle Tree ( in `earningsTree.JSON`) to re-generate the snapshot Merkle Tree, check that the root matches the one included on-chain in the L2 MerkleSnapshot contract and that a proof of inclusion in the Merkle Tree can be computed for the address.
