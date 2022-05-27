# MarketPlace

Try running some of the following tasks:

```shell
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

Tasks:
```
npx hardhat additem --id <Tokenid:param> --owner <address of owner:optinal param> // add item to aldready exists in ERC1155
npx hardhat buyitem --nft <number(721 or 1155):param> --id <TokenId:param>
npx hardhat cansel --nft <number(721 or 1155):param> --id <TokenId:param>
npx hardhat createitem --nft <number(721 or 1155):param> --uri <string hash from uri of token:param> --owner <address of owner:optinal param>
npx hardhat finishauction --nft <number(721 or 1155):param> --id <TokenId:param>
npx hardhat listitem --nft <number(721 or 1155):param> --id <TokenId:param> --price <int price:param>
npx hardhat listitemonauction --nft <number(721 or 1155):param> --id <TokenId:param> --price <int price:param>
npx hardhat makemid --nft <number(721 or 1155):param> --id <TokenId:param> --price <int price:param>
```