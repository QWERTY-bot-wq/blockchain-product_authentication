// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract Identeefi {
    address public owner; 

    struct ProductHistory {
        uint id;
        string actor;
        string location;
        string timestamp;
        bool isSold;
    }

    struct Product {
        string name;
        string serialNumber;
        string description;
        string brand;
        string image;
        uint256 warrantyPeriod;       // ✅ new field
        ProductHistory[] history;     // ✅ dynamic array
    }

    mapping(string => Product) private products;

    constructor() {
        owner = msg.sender;
    }

    function registerProduct(
        string memory _name, 
        string memory _brand, 
        string memory _serialNumber, 
        string memory _description, 
        string memory _image,  
        string memory _actor, 
        string memory _location, 
        string memory _timestamp,
        uint256 _warrantyPeriod       // ✅ new argument
    ) public {
        Product storage p = products[_serialNumber];
        p.name = _name;
        p.brand = _brand;
        p.serialNumber = _serialNumber;
        p.description = _description;
        p.image = _image;
        p.warrantyPeriod = _warrantyPeriod;   // ✅ store warranty

        addProductHistory(_serialNumber, _actor, _location, _timestamp, false);
    }

    function addProductHistory(
        string memory _serialNumber, 
        string memory _actor, 
        string memory _location, 
        string memory _timestamp, 
        bool _isSold
    ) public {
        Product storage p = products[_serialNumber];
        uint newId = p.history.length + 1;

        p.history.push(ProductHistory(newId, _actor, _location, _timestamp, _isSold));

        console.log("i1: %s", newId);
        console.log("Product History added: %s", _actor);
        console.log("Product : %s", p.name);
    }

    function getProduct(string memory _serialNumber) 
        public 
        view 
        returns (
            string memory, 
            string memory, 
            string memory, 
            string memory, 
            string memory, 
            uint256,                  // ✅ return warrantyPeriod
            ProductHistory[] memory
        ) 
    {
        Product storage p = products[_serialNumber];
        return (
            p.serialNumber, 
            p.name, 
            p.brand, 
            p.description, 
            p.image, 
            p.warrantyPeriod,         // ✅ include warranty
            p.history
        );
    }
}
