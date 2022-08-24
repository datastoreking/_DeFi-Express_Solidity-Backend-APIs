// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Tombird is ERC1155, Ownable {
    
    uint256 public token_id;
    IERC20 public USDC;
    mapping(address => uint256) public _nftBalance;
    string public baseMetadataURI; //the token metadata URI

    constructor(IERC20 USDC_address, string memory _uri) ERC1155("") {
        setURI(_uri);
        baseMetadataURI = _uri;
        USDC = USDC_address;
        _nftBalance[msg.sender] = 0;
    }

    /*
    sets our URI and makes the ERC1155 OpenSea compatible
    */
    function uri(uint256 _tokenid) override public view returns (string memory) {
        return string(
            abi.encodePacked(
                baseMetadataURI,
                Strings.toString(_tokenid),".json"
            )
        );
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(uint256 id, uint256 amount) public
    {
        require(amount == 1, "Wrong Mint function");
        uint256 userBalance = USDC.balanceOf(msg.sender);
        require(1000000 <= userBalance, "User balance is not enough");
        USDC.transferFrom(msg.sender, address(this), 1000000);
        _mint(msg.sender, id, amount, "");
        token_id = id;
        _nftBalance[msg.sender] += 1;
    }

    function gift(address account, uint256 id, uint256 amount) public onlyOwner 
    {
        _mint(account, id, amount, "");
        token_id = id;
    }

    function mintBatch(uint256[] memory ids, uint256[] memory amounts, uint256 mintCount) public
    {
        if(mintCount == 15){
            uint256 userBalance = USDC.balanceOf(msg.sender);
            require(10000000 <= userBalance, "User balance is not enough");
            require(amounts.length == mintCount, "Check the amount of token id");
            USDC.transferFrom(msg.sender, address(this), 10000000);
            _mintBatch(msg.sender, ids, amounts, "");
            _nftBalance[msg.sender] += 15;
        }
        else if(mintCount == 100){
            uint256 userBalance = USDC.balanceOf(msg.sender);
            require(50000000 <= userBalance, "User balance is not enough");
            require(amounts.length == mintCount, "Check the amount of token id");
            USDC.transferFrom(msg.sender, address(this), 50000000);
            _mintBatch(msg.sender, ids, amounts, "");
            _nftBalance[msg.sender] += 100;
        }
        token_id = ids[ids.length - 1];
    }
}