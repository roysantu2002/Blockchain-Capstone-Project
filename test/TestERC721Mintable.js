var ERC721MintableComplete = artifacts.require('ERC721MintableComplete');
const truffleAssert = require('truffle-assertions');
const expect = require('chai').expect;

contract('ERC721MintableComplete', accounts => {

    const owner = accounts[0];
    const randomAcc = accounts[1];
    const tokenHolderOne = accounts[2];
    const tokenHolderTwo = accounts[3];
    const tokenHolderThree = accounts[4];

    describe('match erc721 spec', () => {
        beforeEach(async () => {
            this.contract = await ERC721MintableComplete.new({from: owner});

            // TODO: mint multiple tokens (1 ones, 2 twos, 3 threes)
            await this.contract.mint(tokenHolderOne, 1, {from: owner});
            await this.contract.mint(tokenHolderTwo, 2, {from: owner});
            await this.contract.mint(tokenHolderTwo, 3, {from: owner});
            await this.contract.mint(tokenHolderThree, 4, {from: owner});
            await this.contract.mint(tokenHolderThree, 5, {from: owner});
            await this.contract.mint(tokenHolderThree, 6, {from: owner});
        });

        it('should return total supply', async () => {
            let totalSupply = await this.contract.totalSupply.call();
            assert.equal(totalSupply.toNumber(), 6, "Wrong total supply");
        });

        it('should get token balance', async () => {
            let bal = await this.contract.balanceOf.call(tokenHolderOne);
            assert.equal(bal, 1, "Wrong balance for tokenHolderOne");
            bal = await this.contract.balanceOf.call(tokenHolderTwo);
            assert.equal(bal, 2, "Wrong balance for tokenHolderTwo");
            bal = await this.contract.balanceOf.call(tokenHolderThree);
            assert.equal(bal, 3, "Wrong balance for tokenHolderThree");
        });

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async () => {
            let uri = await this.contract.tokenURI.call(1);
            assert.equal(
                uri, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1",
                "Wrong tokenURI for token ID 1");
            uri = await this.contract.tokenURI.call(5);
            assert.equal(
                uri, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/5",
                "Wrong tokenURI for token ID 5");
        });

        it('should transfer token from one owner to another', async () => {
            let _tokenId = 6;
            let _owner = await this.contract.ownerOf.call(_tokenId);
            assert.equal(_owner, tokenHolderThree, "Incorrect initial owner of token");
            let tx = await this.contract.transferFrom(
                tokenHolderThree, randomAcc, _tokenId, {from: tokenHolderThree});
            await truffleAssert.eventEmitted(tx, "Transfer", (ev) => {
                return (
                    ev.from == tokenHolderThree &&
                    ev.to == randomAcc &&
                    ev.tokenId == _tokenId
                );
            });
            _owner = await this.contract.ownerOf.call(_tokenId);
            assert.equal(_owner, randomAcc, "Wrong owner of token after transfer");
            // transfer back
            await this.contract.transferFrom(
                randomAcc, tokenHolderThree, _tokenId, {from: randomAcc});
        });
    });

    describe('have ownership properties', () => {
        beforeEach(async () => {
            this.contract = await ERC721MintableComplete.new({from: owner});
        });

        it('should return contract owner', async () => {
            let owner = await this.contract.getOwner.call();
            assert.equal(owner, owner, "Wrong owner returned");
        });

        it('should fail minting when address is not contract owner', async () => {
            await truffleAssert.reverts(
                this.contract.mint(randomAcc, 99, {from: randomAcc})
            );
        });
    });

    describe('have pausable properties', () => {
        beforeEach(async () => {
            this.contract = await ERC721MintableComplete.new({from: owner});
        });

        it('can pause and unpause', async () => {
            let tx = await this.contract.pause({from: owner});
            let status = await this.contract.isPaused.call();
            assert.equal(status, true, "Wrong pause state 2");
            tx = await this.contract.unpause({from: owner});
            status = await this.contract.isPaused.call();
            assert.equal(status, false, "Wrong paused state 3");
        });

        it('should return pause status', async () => {
            let paused = await this.contract.isPaused.call();
            assert.equal(paused, false, "Wrong paused state 1");
        });

        it('should fail minting when contract is paused ', async () => {
            await this.contract.pause({from: owner});
            await truffleAssert.reverts(
                this.contract.mint(randomAcc, 99, {from: owner})
            );
            await this.contract.unpause({from: owner});
        });
    });
});