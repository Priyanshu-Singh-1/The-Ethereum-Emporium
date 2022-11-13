// mocha nd chai
// mocha testing framework in javascript
// for running test go to terminal and put truffle test command
// and you will see if its passing or failing

const { assert } = require("chai")
require('chai')
  .use(require('chai-as-promised'))
  .should()



// chai is assertion library
const Marketplace = artifacts.require('./Marketplace.sol')

contract('Marketplace', ([deployer, seller, buyer]) => { 
    // these are all the accounts in the ganache workspace...its an array...lets assume 1st account in ganache is deloyer which it is actually by default, 2nd acc in of seller and 3rd is of buyer

    let marketplace 
    // we will store the deployed smart contract in this var as we want it o be accessible to all the test we are going to write here
   
    before(async () => {
        // deployed is an asynchronous function call
        // so js can allow to resume code exceution while this function deployed is still being called and has not finished its execution
        // so like it doesnt wait for this function to finish to move to next line...
        // so that's why we use await keyword to make that happen..to make it wait
        // nd we can only use await with an async context thats why we have async there at the top in (before )
        // nd below in describe we used aync keyword then only we can use await keyword
        marketplace = await Marketplace.deployed()
        // this will give us the deployed copy of smart contract...this command is same as we ran in truffle console

    })
    // describe comes with mocha
    // here in describe deplyment we are writing tests related to smart contracts deployment
    describe('deployment', async () => {
        // 1st test
        it('deploys successfully', async () => {  // deploys successfully is just the name of this particular test
            const address = await marketplace.address //fetch address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
            /// so what these all things are doing is getting the adress of smart contract...like we accessed in truffle console and ensuring that it is present and not zero
            // we are also checking that its not null, empty string nd undefined
        })

        //2nd test
        // now even check for that the state var name is defined properly like we accessed the var name's value using truffle console
        it('has a name', async () => { // has a name is just the name of this particular test
            const name = await marketplace.name() //fetch name
            assert.equal(name, 'Ethereum Marketplace')
        })
    })

    // here in describe products we are writing tests realted to products..its creation,selling ,purchase and all
    describe('products', async () => {
        let result, productCount
        // in result var we will store the created product and update the count in productCount var
    
        before(async () => {
          result = await marketplace.createProduct('MacBook Pro', web3.utils.toWei('1', 'Ether'), { from : seller }) // this from part is metadata...and is telling solidity that msg.sender is seller...as defined in Marketplace smart contract
          // we used this toWei function bcz smart contracts deals in wei and 1 ether = 10^18 wei so instead of writing that big number we used this function which converted 1 ether to 10^18 wei so that smart contract can use it
          productCount = await marketplace.productCount()
          // this createProduct and productCount functions are all defined in Marketplace smartcontract which we are using here as we imported that file in this test file also at the top using code artifacts.require
        })
    
        it('creates products', async () => {
          // SUCCESS
          assert.equal(productCount, 1) // we are checking if product count got increased to 1 as we just created a product MacBook Pro
          //console.log(result.logs) //using this we can fetch the logs in terminal, we will see the product id, name, price , owner and all the things in args section of logs.. as we just created it so we can see it if we fetch the logs
          const event = result.logs[0].args // so we fetched it...now we want to dig into those values and check for each that its correct and valid or not
          assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
          assert.equal(event.name, 'MacBook Pro', 'name is correct')
          assert.equal(event.price, '1000000000000000000', 'price is correct')
          assert.equal(event.owner, seller, 'owner is correct') //make sure owner is the seller
          assert.equal(event.purchased, false, 'purchased is correct')

          // FAILURE: Product must have a name
          await await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
          // FAILURE: Product must have a price
          await await marketplace.createProduct('MacBook Pro', 0, { from: seller }).should.be.rejected;
        })

        it('lists products', async () => { //this checks if the products are getting stored on blockchain correctly and we are able to fetch it or not
            const product = await marketplace.products(productCount) //fetching product from blockchain from mapping named products using productCount which acts like product id... we had created in Marketplace smart contract
            assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(product.name, 'MacBook Pro', 'name is correct')
            assert.equal(product.price, '1000000000000000000', 'price is correct')
            assert.equal(product.owner, seller, 'owner is correct')
            assert.equal(product.purchased, false, 'purchased is correct')
        })

        it('sells products', async () => {
            // Track the seller balance before purchase
            let oldSellerBalance
            oldSellerBalance = await web3.eth.getBalance(seller) //fetching balance
            oldSellerBalance = new web3.utils.BN(oldSellerBalance) // conerting to BigNumber
      
            // SUCCESS: Buyer makes purchase
            result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})
            // so as we can see the function purchaseProduct defined in smart contract accepts only id as argument but still we can pass the value as metadata to it...nd in that value we can send 1 ether which is the price of product
      
            // Check logs
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'MacBook Pro', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, buyer, 'owner is correct')
            assert.equal(event.purchased, true, 'purchased is correct')
      
            // Check that seller received funds
            let newSellerBalance
            newSellerBalance = await web3.eth.getBalance(seller)
            newSellerBalance = new web3.utils.BN(newSellerBalance)
      
            // Price of product
            let price
            price = web3.utils.toWei('1', 'Ether')
            price = new web3.utils.BN(price)
      
            // we are checking that after adding price of product to sellers old balance...is it equal to sellers new balance
            const exepectedBalance = oldSellerBalance.add(price)
      
            assert.equal(newSellerBalance.toString(), exepectedBalance.toString())
      
            // FAILURE: Tries to buy a product that does not exist, i.e., product must have valid id
            await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
            // FAILURE: Buyer tries to buy without enough ether
            await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
            // FAILURE: Deployer tries to buy the product, i.e., product can't be purchased twice
            await marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
            // FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
            await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
          })
    })

})