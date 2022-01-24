// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import './Booster.sol';

contract Supplier {

    event EventBoughtBooster(
        address indexed user,
        string boosterName,
        uint256 date,
        uint256 tokenID
    );

    event EventRedeemBooster(
        address indexed user,
        string boosterName,
        uint256 date,
        uint256 tokenID
    );

    address payable owner;

    struct Food {
        string name;
        string restaurant;
        uint256 price;
    }

    struct Voucher {
        string name;
        uint256 value;
    }

    // struct Reward {
    //     string name;
    //     uint256 target;
    // }

    struct BoosterToken {
        string tier;
        uint256 tokenID;
    }

    // BoosterToken[] public boosterTokens;
    mapping(address => BoosterToken[]) public suppliersBoosterTokens;

    mapping (string => Food) public foodMeta;
    mapping (string => Voucher) public voucherMeta;
    // mapping (string => Reward) public rewardMeta;

    // restaurant name => things in the restaurant
    mapping (string => Food[]) public foods;
    mapping (string => Voucher[]) public vouchers;
    // mapping (string => Reward[]) public rewards;

    Booster public booster;

    constructor() {
        owner = payable(msg.sender);
        booster = new Booster();
    }

    function listFood(string memory _name, string memory _restaurant, uint256 _price) public {
        Food memory food = Food({
            name: _name,
            price: _price,
            restaurant: _restaurant
        });
        foodMeta[_name] = food;
        foods[_restaurant].push(food);
    }

    function getFoodPrice(string memory name) public view returns (uint256) {
        return foodMeta[name].price;
    }

    function getFoodRestaurant(string memory name) public view returns (string memory) {
        return foodMeta[name].restaurant;
    }

    function getVoucherValue(string memory name) public view returns (uint256) {
        return voucherMeta[name].value;
    }

    function listVoucher(string memory _name, string memory _restaurant, uint256 _value) public {
        Voucher memory voucher = Voucher({
            name: _name,
            value: _value
        });
        voucherMeta[_name] = voucher;
        vouchers[_restaurant].push(voucher);
    }

    // function listReward(string memory _name, string memory _restaurant, uint256 _target) public {
    //     Reward memory reward = Reward({
    //         name: _name,
    //         target: _target
    //     });
    //     rewardMeta[_name] = reward;
    //     rewards[_restaurant].push(reward);
    // }

    function buyBooster(string memory tier) public payable returns (uint256) {
        require(msg.value >= 1, "Insufficient money");
        uint256 tokenID = booster.buy(msg.sender, tier); // mint token
        BoosterToken memory boosterToken = BoosterToken({
            tier: tier,
            tokenID: tokenID
        });
        // boosterTokens[tokenID] = boosterToken; // track all tokens
        suppliersBoosterTokens[msg.sender].push(boosterToken); // track all customer tokens
        // lastTokenID = tokenID;
        // return tokenID;
        emit EventBoughtBooster(msg.sender, tier, block.timestamp, tokenID);
        return tokenID;
    }

    function redeemBooster(uint256 boosterID) public {
        uint256 oldTokenBalance = booster.balanceOf(msg.sender);
        BoosterToken[] storage tokens = suppliersBoosterTokens[msg.sender];
        for (uint256 i = 0; i < oldTokenBalance; i++) {
            if (tokens[i].tokenID == boosterID) {
                emit EventRedeemBooster(msg.sender, tokens[i].tier, block.timestamp, tokens[i].tokenID);
                tokens[i] = tokens[oldTokenBalance - 1];
                tokens.pop();
                break;
            }
        }
        booster.redeem(msg.sender, boosterID);
    }

    function buyAndRedeemBooster(string memory tier) public payable {
        uint256 tokenID = buyBooster(tier);
        redeemBooster(tokenID);
    }

    function getSupplierBoosters() public view returns (BoosterToken[] memory) {
        return suppliersBoosterTokens[msg.sender];
    }

}
