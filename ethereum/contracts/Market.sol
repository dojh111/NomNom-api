// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;


import './Supplier.sol';
import './Food.sol';
import './Voucher.sol';

contract Market {

    event EventBoughtFood(
        address indexed user,
        string foodName,
        string restaurantName,
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

    event EventBoughtVoucher(
        address indexed user,
        string voucherName,
        uint256 date,
        uint256 tokenID
    );

    event EventRedeemVoucher(
        address indexed user,
        string voucherName,
        uint256 date,
        uint256 tokenID
    );

    event EventGiftVoucher(
        address indexed user,
        address indexed receiver,
        string voucherName,
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
    Voucher public voucher;

    mapping (address => Customer) private customers;

    uint256 lastTokenID;

    constructor() payable {
        supplier = new Supplier();
        food = new Food();
        voucher = new Voucher();
    }

    function buyFood(string memory foodName) public payable returns (uint256){
        uint256 price = supplier.getFoodPrice(foodName);
        string memory restaurant = supplier.getFoodRestaurant(foodName);
        require(msg.value >= price, "Insufficient money");
        uint256 tokenID = food.buy(msg.sender, foodName); // mint token
        Token memory foodToken = Token({
            name: foodName,
            tokenID: tokenID
        });
        foodTokens[tokenID] = foodToken; // track all tokens
        customers[msg.sender].ownedFoods.push(foodToken); // track all customer tokens
        lastTokenID = tokenID;
        emit EventBoughtFood(msg.sender, foodName, restaurant, block.timestamp, tokenID);
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

    function buyFoodPromo(string memory foodName, uint256 voucherID) public payable returns(uint256){
        uint256 originalPrice = supplier.getFoodPrice(foodName);
        string memory restaurant = supplier.getFoodRestaurant(foodName);
        string memory voucherName = voucher.tokenURI(voucherID);
        uint256 discountedPrice = originalPrice - supplier.getVoucherValue(voucherName);
        require(msg.value >= discountedPrice, "Insufficient money");
        uint256 tokenID = food.buy(msg.sender, foodName); // mint token
        Token memory foodToken = Token({
            name: foodName,
            tokenID: tokenID
        });
        customers[msg.sender].ownedFoods.push(foodToken); // track all customer tokens
        lastTokenID = tokenID;
        emit EventBoughtFood(msg.sender, foodName, restaurant, block.timestamp, tokenID);
        return tokenID;
    }

    function buyAndGiftFoodPromo(string memory foodName, uint256 voucherID, address receiver) public payable {
        uint256 tokenID = buyFoodPromo(foodName, voucherID);
        giftFood(receiver, tokenID);
    }

    function buyVoucher(string memory voucherName) public payable returns (uint256){
        uint256 price = supplier.getVoucherValue(voucherName);
        require(msg.value >= price, "Insufficient money");
        uint256 tokenID = voucher.buy(msg.sender, voucherName); // mint token
        Token memory voucherToken = Token({
            name: voucherName,
            tokenID: tokenID
        });
        voucherTokens[tokenID] = voucherToken; // track all tokens
        customers[msg.sender].ownedVouchers.push(voucherToken); // track all customer tokens
        lastTokenID = tokenID;
        emit EventBoughtVoucher(msg.sender, voucherName, block.timestamp, tokenID);
        return tokenID;
    }

    function redeemVoucher(uint256 tokenID) public {
        revokeVoucherOwnership(msg.sender, tokenID);
        voucher.redeem(msg.sender, tokenID);
        Token storage voucherToken = voucherTokens[tokenID];
        emit EventRedeemVoucher(msg.sender, voucherToken.name, block.timestamp, tokenID);
    }

    function giftVoucher(address receiver, uint256 tokenID) public {
        revokeVoucherOwnership(msg.sender, tokenID);
        voucher.gift(msg.sender, receiver, tokenID);
        Token storage voucherToken = voucherTokens[tokenID];
        customers[receiver].ownedFoods.push(voucherToken);
        emit EventGiftVoucher( msg.sender, receiver, voucherToken.name, block.timestamp, tokenID);
    }

    function buyAndGiftVoucher(string memory voucherName, address receiver) public payable {
        uint256 tokenID = buyVoucher(voucherName);
        giftVoucher(receiver, tokenID);
    }

    function revokeVoucherOwnership(address owner, uint256 tokenID) private {
        uint256 oldTokenBalance = voucher.balanceOf(msg.sender);
        Customer storage customer = customers[owner];
        Token[] storage ownedVouchers = customer.ownedVouchers;
        for (uint256 i = 0; i < oldTokenBalance; i++) {
            if (ownedVouchers[i].tokenID == tokenID) {
                ownedVouchers[i] = ownedVouchers[oldTokenBalance - 1];
                ownedVouchers.pop();
                break;
            }
        }
    }

    function getCustomerFoods() public view returns (Token[] memory) {
        return customers[msg.sender].ownedFoods;
    }

    function getCustomerVouchers() public view returns (Token[] memory) {
        return customers[msg.sender].ownedVouchers;
    }
}