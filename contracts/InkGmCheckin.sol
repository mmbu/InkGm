// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InkGmCheckin {
    error AlreadyCheckedIn();

    uint256 public totalGm;
    mapping(address => uint256) public lastGmDay;

    function gm() external {
        uint256 dayNumber = block.timestamp / 1 days;
        if (lastGmDay[msg.sender] == dayNumber) revert AlreadyCheckedIn();
        lastGmDay[msg.sender] = dayNumber;
        totalGm += 1;
    }
}
