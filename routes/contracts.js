const express = require('express');
const { get, findIndex, splice } = require('lodash');
const path = require('path');
const fs = require('fs');
const solc = require('solc');
const router = express.Router();
const User = require('../models/User');

function findImport(importPath) {
    try {
        const filePath = path.join(__dirname, '../node_modules', importPath);
        const contents = fs.readFileSync(filePath, 'utf8');
        return { contents };
    } catch (err) {
        return { error: 'File not found' };
    }
}

router.put('/airdrop', async (req, res) => {
    try {
        const address = get(req, 'body.airdropAddress', '0x0');
        const airdropName = get(req, 'body.airdropName', 'MyAirdrop');
        const tokenAddress = get(req, 'body.tokenAddress', '0x0');
        const network = get(req, 'body.network', '1');

        const user = await User.findOne({ email: req.user?.email });
        if (!user) {
            return res.json({ success: false, error: { message: 'Please log in' } });
        }
        const contract = user.contracts.find(contract => contract.address === address);
        if (contract) {
            return res.json({ success: false, error: { message: 'Contract already stored' } });
        }
        const newContract = {
            address,
            network,
            name: airdropName,
            type: 'standard',
            tokenAddress,
            deployedAt: new Date()
        };
        const newContracts = [...user.contracts, newContract];
        user.contracts = newContracts;
        await user.save();
        res.json({ success: true, contracts: newContracts });
    } catch (err) {
        res.json({ success: false, error: err });
    }
});

router.post('/airdrop', async (req, res) => {
    try {
        const tokenAddress = get(req, 'body.tokenAddress', 'MyToken');
        const myAirdropSource = `
        // SPDX-License-Identifier: MIT
        pragma solidity >=0.7.0;
        import "@openzeppelin/contracts/access/Ownable.sol";
        import "@openzeppelin/contracts/utils/math/SafeMath.sol";
        import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

        abstract contract Token is ERC20 {}

        contract Airdrop is Ownable {
            using SafeMath for uint;

            address public tokenAddr;

            event EtherTransfer(address beneficiary, uint amount);

            constructor() public {
                tokenAddr = ${tokenAddress};
            }

            function dropTokens(address[] memory _recipients, uint256[] memory _amount) public onlyOwner returns (bool) {
            
                for (uint i = 0; i < _recipients.length; i++) {
                    require(_recipients[i] != address(0));
                    require(Token(tokenAddr).transfer(_recipients[i], _amount[i]));
                }

                return true;
            }

            function dropEther(address[] memory _recipients, uint256[] memory _amount) public payable onlyOwner returns (bool) {
                uint total = 0;

                for(uint j = 0; j < _amount.length; j++) {
                    total = total.add(_amount[j]);
                }

                require(total <= msg.value);
                require(_recipients.length == _amount.length);


                for (uint i = 0; i < _recipients.length; i++) {
                    require(_recipients[i] != address(0));

                    payable(_recipients[i]).transfer(_amount[i]);

                    emit EtherTransfer(_recipients[i], _amount[i]);
                }

                return true;
            }

            function updateTokenAddress(address newTokenAddr) public onlyOwner {
                tokenAddr = newTokenAddr;
            }

            function withdrawTokens(address beneficiary) public onlyOwner {
                require(Token(tokenAddr).transfer(beneficiary, Token(tokenAddr).balanceOf(address(this))));
            }

            function withdrawEther(address payable beneficiary) public onlyOwner {
                beneficiary.transfer(address(this).balance);
            }
        }`;

        const input = {
            language: 'Solidity',
            sources: { ['Airdrop.sol']: { content: myAirdropSource } },
            settings: { outputSelection: { '*': { '*': ['*'] } } }
        };

        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));
        let warning;
        if (Array.isArray(output.errors)) {
            for (let error of output.errors) {
                if (error.severity === 'error') {
                    return res.json({ success: false, error: error.message });
                } else {
                    warning = error.message;
                }
            }
        }

        res.json({ success: true, output, warning });
    } catch (err) {
        res.json({ success: false, error: err });
    }
});

router.put('/token', async (req, res) => {
    try {
        const address = get(req, 'body.address', '0x0');
        const name = get(req, 'body.name', 'MyToken');
        const symbol = get(req, 'body.symbol', 'MTK');
        const network = get(req, 'body.network', '1');

        const user = await User.findOne({ email: req.user?.email });
        if (!user) {
            return res.json({ success: false, error: { message: 'Please log in' } });
        }
        const contract = user.contracts.find(contract => contract.address === address);
        if (contract) {
            return res.json({ success: false, error: { message: 'Contract already stored' } });
        }
        const newContract = {
            address,
            network,
            name: `${name} (${symbol})`,
            type: 'token',
            tokenAddress: null,
            deployedAt: new Date()
        };
        const newContracts = [...user.contracts, newContract];
        user.contracts = newContracts;
        await user.save();
        res.json({ success: true, contracts: newContracts });
    } catch (err) {
        res.json({ success: false, error: err });
    }
});

router.post('/token', async (req, res) => {
    try {
        const name = get(req, 'body.name', 'MyToken');
        const symbol = get(req, 'body.symbol', 'MTK');
        const amount = get(req, 'body.amount', '1000');
        const myTokenSource = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

        contract ${name} is ERC20 {
            constructor() ERC20("${name}", "${symbol}") {
                _mint(msg.sender, ${amount} * (10 ** uint256(decimals())));
            }
        }`;

        const input = {
            language: 'Solidity',
            sources: { [`${name}.sol`]: { content: myTokenSource } },
            settings: { outputSelection: { '*': { '*': ['*'] } } }
        };

        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));
        let warning;
        if (Array.isArray(output.errors)) {
            for (let error of output.errors) {
                if (error.severity === 'error') {
                    return res.json({ success: false, error: error.message });
                } else {
                    warning = error.message;
                }
            }
        }

        res.json({ success: true, output, warning });
    } catch (err) {
        res.json({ success: false, error: err });
    }
});

router.delete('/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const user = await User.findOne({ email: req.user?.email });
        if (!user) {
            return res.json({ success: false, error: { message: 'Please log in' } });
        }
        const contractIndex = findIndex(user.contracts, contract => contract.address === address);
        if (contractIndex === -1) {
            return res.json({ success: false, error: { message: 'Contract not found' } });
        }
        user.contracts.splice(contractIndex, 1);
        await user.save();
        res.json({ success: true, contracts: user.contracts });
    } catch (err) {
        res.json({ success: false, error: err });
    }
});

module.exports = router;