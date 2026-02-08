// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract InkGm1155 is ERC1155, ReentrancyGuard {
    error MaxSupplyReached();
    error WalletLimitReached();
    error IncorrectPayment();
    error PayoutFailed();

    uint256 public constant TOKEN_ID = 1;
    uint256 public constant MAX_SUPPLY = 5000;
    uint256 public constant PRICE = 0.002 ether;

    address public immutable treasury;
    uint256 public totalMinted;

    constructor(string memory baseUri, address treasuryAddress) ERC1155(baseUri) {
        require(treasuryAddress != address(0), "Treasury required");
        treasury = treasuryAddress;
    }

    function mint() external payable nonReentrant {
        if (msg.value != PRICE) revert IncorrectPayment();
        if (totalMinted >= MAX_SUPPLY) revert MaxSupplyReached();
        if (balanceOf(msg.sender, TOKEN_ID) >= 1) revert WalletLimitReached();

        totalMinted += 1;
        _mint(msg.sender, TOKEN_ID, 1, "");

        (bool success, ) = payable(treasury).call{value: msg.value}("");
        if (!success) revert PayoutFailed();
    }
}
