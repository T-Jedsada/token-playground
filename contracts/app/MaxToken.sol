pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract MaxToken is ERC20, Ownable {

    string public constant name = "MaxToken";
    string public constant symbol = "MT";
    uint8 public constant decimals = 5;

    uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(decimals));

    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}