const express = require('express');
const { get } = require('lodash');
const path = require('path');
const fs = require('fs');
const solc = require('solc');
const router = express.Router();

function findImport(importPath) {
    try {
        const filePath = path.join(__dirname, '../node_modules', importPath);
        const contents = fs.readFileSync(filePath, 'utf8');
        return { contents };
    } catch (err) {
        return { error: 'File not found' };
    }
}

router.post('/token', async (req, res) => {
    try {
        const name = get(req, 'body.name', 'MyToken');
        const symbol = get(req, 'body.symbol', 'MTK');
        const myTokenSource = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

        contract ${name} is ERC20 {
            constructor() ERC20("${name}", "${symbol}") {
                _mint(msg.sender, 1000 * (10 ** uint256(decimals())));
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

module.exports = router;