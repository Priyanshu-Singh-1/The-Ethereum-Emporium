// state var writes information to the blockchain..it belongs to a particular entire smart contract like a class var would in other programming language
//if we want to access the var from outside the smart contract make it public
// so now we can create a function to fetch this var value and we can see it...otherwise function wouldnt have been able to access it if wouldnt have been made public
// constructor is a function that gets run only one time whenver the smart contract is deployed...and inside it we can set the value of the state var that we declared...
// constructor lies inside the smart contract only

//to intercat with smart contract or blockchain from the terminal..use command truffle console
//to see all the accounts in our blockchain...like here we are using our private local blockchain environment ganache
// so it will show all the accounts that are there in our ganache workspace
// commnad = accounts = await web3.eth.getAccounts()
// we can also see the blocknumber i.e e are connected to which block no on our blockchain...ie the index of the account we are connected to in ganache
// command = blockNo = await web3.eth.getBlockNumber()
// we can even interact or check the smart contracts using this console so for that we can get a copy of the smart contract deployed
// command = marketplace = await Marketplace.deployed()
// we can get the address of smart contract using
// command = marketplace.address
// even to get the value of the state var like here we have state var name...to get its value using console
// command = name = await marketplace.name()
// to exit console
// command = .exit
// using these commands we can run a smoke test to check that everything is fine and we can start
// we will have to write a full fledged test also

// _var names are local variables and var names are state variables


pragma solidity ^0.5.0;

contract Marketplace{
    string public name;

    //here key is gonna be product id and value is whole product struct
    mapping(uint => Product) public products; //name the mapping products
    // so by defining this mapping now we have a place to store or put these products
    // so like using mapping , product is getting stored on the blockchain and whenver we are reading or fetching details of product from mapping , it is getting read from the blockchain

    // nd we have to keep count of how many products are there in mapping products
    // we cant directly do it and lets say if we had 5 no of products then if we will call for 6th one and we will get an product with empty id and null name like that
    // so define a var to keep count and evrytime we add a product increament it by 1 , by this way we can keep track of counts
    uint public productCount = 0;

    //model the product..ie define the atrributes of product using struct
    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public{
        name = "Ethereum Marketplace";
    }

    function createProduct(string memory _name, uint _price) public {
        //three things to take care of in this function
        // 1) make sure parameters are correct for creating a product
        // Require a valid name
        require(bytes(_name).length > 0);
        // Require a valid price
        require(_price > 0);
        // Increment product count
        // 2) increament the product count
        productCount ++;
        // 3) create the product...i.e add the product to the mapping to store it in blockchain
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);//here productCounts become id of the product created as whenever we create prpoduct we increament count so it works like id
        // we will only specify name and price in function call, count will be detected, owner will be msg.sender and we just created here so purchased will be false in this case
        // 4) trigger the event...ie tell the blockchain about it...that is sth happened...i.e checking logs
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
        // now we will be able to see this logged out whenever we call the function instead of our test
    }

    function purchaseProduct(uint _id) public payable { //payable modifier as then only we can send ethers
        // 1)Fetch the product
        // memory means we are having a copy of product..not original one stored on blockchain
        Product memory _product = products[_id]; //here _product is local var of type Product(struct) and we are storing products[_id] in it ie from mapping we are fetching this uisng id
        // 2)Fetch the owner..i.e seller
        address payable _seller = _product.owner;
        // 3) Check if product and transaction is valid
        // Make sure the product has a valid id
        require(_product.id > 0 && _product.id <= productCount);
        // Require that there is enough Ether in the transaction
        require(msg.value >= _product.price);
        // Require that the product has not been purchased already
        require(!_product.purchased);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);
        // 4) Purchase the product
        // Transfer ownership to the buyer
        _product.owner = msg.sender; //buyer is gonna be person calling this function..so msg.sender
        // Mark as purchased
        _product.purchased = true;
        // Update the product
        products[_id] = _product; // i.e again the product will be stored in mapping in blockchain but with updation like change of ownership and all that we modified above to make sure transcation is successfull
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value); //this msg.value access that metadata value 1 ether that we passed in test
        // 5) Trigger an event
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
    }
}

//