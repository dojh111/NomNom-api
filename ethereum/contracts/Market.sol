// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;


import './Supplier.sol';
import './Food.sol';

contract Market {

    event EventBoughtFood(
        address indexed user,
        string foodName,
        uint256 date,
        uint256 tokenID
    );

    event EventRedeemFood(
        address indexed user,
        string foodName,
        uint256 date,
        uint256 tokenID
    );

    event EventGiftFood(
        address indexed user,
        address indexed receiver,
        string foodName,
        uint256 date,
        uint256 tokenID
    );

    struct Token {
        string name;
        uint256 tokenID;
    }
    struct Customer {
        uint256 buyCount;
        Token[] ownedFoods;
        Token[] ownedVouchers;
        Token[] ownedRewards;
    }

    Token[] public foodTokens;
    Token[] public voucherTokens;

    Supplier public supplier;
    Food public food;

    mapping (address => Customer) private customers;

    uint256 lastTokenID;

    constructor() payable {
        supplier = new Supplier();
        food = new Food();
    }

    function buyFood(string memory foodName) public payable returns (uint256){
        uint256 price = supplier.getFoodPrice(foodName);
        require(msg.value >= price, "Insufficient money");
        uint256 tokenID = food.buy(msg.sender, foodName); // mint token
        Token memory foodToken = Token({
            name: foodName,
            tokenID: tokenID
        });
        foodTokens[tokenID] = foodToken; // track all tokens
        customers[msg.sender].ownedFoods.push(foodToken); // track all customer tokens
        lastTokenID = tokenID;
        emit EventBoughtFood(msg.sender, foodName, block.timestamp, tokenID);
        return tokenID;
    }

    function redeemFood(uint256 tokenID) public {
        revokeFoodOwnership(msg.sender, tokenID);
        food.redeem(msg.sender, tokenID);
        Token storage foodToken = foodTokens[tokenID];
        emit EventRedeemFood(msg.sender, foodToken.name, block.timestamp, tokenID);
    }

    function giftFood(address receiver, uint256 tokenID) public {
        revokeFoodOwnership(msg.sender, tokenID);
        food.gift(msg.sender, receiver, tokenID);
        Token storage foodToken = foodTokens[tokenID];
        customers[receiver].ownedFoods.push(foodToken);
        emit EventGiftFood( msg.sender, receiver, foodToken.name, block.timestamp, tokenID);
    }

    function buyAndGiftFood(string memory foodName, address receiver) public payable {
        uint256 tokenID = buyFood(foodName);
        giftFood(receiver, tokenID);
    }

    function revokeFoodOwnership(address owner, uint256 foodID) private {
        uint256 oldTokenBalance = food.balanceOf(msg.sender);
        Customer storage customer = customers[owner];
        Token[] storage ownedFoods = customer.ownedFoods;
        for (uint256 i = 0; i < oldTokenBalance; i++) {
            if (ownedFoods[i].tokenID == foodID) {
                ownedFoods[i] = ownedFoods[oldTokenBalance - 1];
                ownedFoods.pop();
                break;
            }
        }
    }

    function getCustomerFoods() public view returns (Token[] memory) {
        return customers[msg.sender].ownedFoods;
    }

}
