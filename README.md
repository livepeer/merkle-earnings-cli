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
  -c --claim <keystoreFile> <password>  Claim snapshot earnings
  -h, --help
```

## Install

```
$ npm install
```

## Build

```
$ npm run build
```

## Run 
```
$ mearnings [options]
```