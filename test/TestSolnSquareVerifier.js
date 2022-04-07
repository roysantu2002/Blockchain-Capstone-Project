const SquareVerifier = artifacts.require('SquareVerifier');
const SolnSquareVerifier = artifacts.require('SolnSquareVerifier');
const truffleAssert = require('truffle-assertions');


contract('SolnSquareVerifier Test Cases', accounts => {

    const ownerAddress = accounts[0];
    const holderAddress = accounts[1];
    const randomAcc = accounts[2];

    describe('Mint token by providing solution', () => {
        beforeEach(async () => {
            const squareContract = await SquareVerifier.new({from: ownerAddress});
            this.contract = await SolnSquareVerifier.new(
                squareContract.address, {from: ownerAddress}
            );
        });

        // Test if a new solution can be added for contract - SolnSquareVerifier
        // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
        // using proof.json from 25**2 == 625 (correct)
        it('Mint token using correct proof', async () => {
            let tokenId = 101;
            let tx = await this.contract.mintUREMToken(
                holderAddress,
                tokenId,
                ["0x1e8d756b4c31ae22326b587d569feac78a23ec7a9c3876c59ddca6a68e976c64", "0x23cef095ac2ba68ad1818af4030f9592594475ec8f9c2e25dc2ac79c01730169"],
                [["0x14e4b702eca9f62fea74a0044bd9e98d59e837397f3aa06654ac77293479050a", "0x0ff4c97f35b5265a35d14b41ac8810ac17c38580802f74dbc72fd73e80ec63e0"], ["0x20b42b9cc8aab96c5817452179d40de49bb49c988b06278195b9c1b7981aebe1", "0x08f8bdf850e91cd073cd5b02ee4d4a6fdc0695653e74e0c510488f98aa95d114"]],
                ["0x1ee25060c69eec2861b3a17eb705c28151708e71939b8cb2935c2dc6e82020f9", "0x2bf819edf4f0b7c58c07b16728b9b30d2ca1451afda66ff673d1b57dd00d2c5e"],
                ["0x0000000000000000000000000000000000000000000000000000000000000009", "0x0000000000000000000000000000000000000000000000000000000000000001"],
                {from: ownerAddress}
            );
            await truffleAssert.eventEmitted(tx, "SolutionAdded", (ev) => {
                return (ev.to == holderAddress && ev.tokenId == tokenId);
            });
            let _ownerAddress = await this.contract.ownerOf.call(tokenId);
            assert.equal(_ownerAddress, holderAddress, "Wrong ownerAddress");
            let bal = await this.contract.balanceOf.call(holderAddress);
            assert.equal(bal, 1, "Incorrect balance for holderAddress after mint");
        });

        it('should not allow solution to reuse', async () => {
            let tokenId = 201;
            await this.contract.mintUREMToken(
                holderAddress,
                tokenId,
                ["0x1e8d756b4c31ae22326b587d569feac78a23ec7a9c3876c59ddca6a68e976c64", "0x23cef095ac2ba68ad1818af4030f9592594475ec8f9c2e25dc2ac79c01730169"],
                [["0x14e4b702eca9f62fea74a0044bd9e98d59e837397f3aa06654ac77293479050a", "0x0ff4c97f35b5265a35d14b41ac8810ac17c38580802f74dbc72fd73e80ec63e0"], ["0x20b42b9cc8aab96c5817452179d40de49bb49c988b06278195b9c1b7981aebe1", "0x08f8bdf850e91cd073cd5b02ee4d4a6fdc0695653e74e0c510488f98aa95d114"]],
                ["0x1ee25060c69eec2861b3a17eb705c28151708e71939b8cb2935c2dc6e82020f9", "0x2bf819edf4f0b7c58c07b16728b9b30d2ca1451afda66ff673d1b57dd00d2c5e"],
                ["0x0000000000000000000000000000000000000000000000000000000000000009", "0x0000000000000000000000000000000000000000000000000000000000000001"],
                {from: ownerAddress}
            );

            // can't reuse same solution
            await truffleAssert.reverts(
                this.contract.mintUREMToken(
                    holderAddress,
                    tokenId+1,
                 ["0x1e8d756b4c31ae22326b587d569feac78a23ec7a9c3876c59ddca6a68e976c64", "0x23cef095ac2ba68ad1818af4030f9592594475ec8f9c2e25dc2ac79c01730169"],
                [["0x14e4b702eca9f62fea74a0044bd9e98d59e837397f3aa06654ac77293479050a", "0x0ff4c97f35b5265a35d14b41ac8810ac17c38580802f74dbc72fd73e80ec63e0"], ["0x20b42b9cc8aab96c5817452179d40de49bb49c988b06278195b9c1b7981aebe1", "0x08f8bdf850e91cd073cd5b02ee4d4a6fdc0695653e74e0c510488f98aa95d114"]],
                ["0x1ee25060c69eec2861b3a17eb705c28151708e71939b8cb2935c2dc6e82020f9", "0x2bf819edf4f0b7c58c07b16728b9b30d2ca1451afda66ff673d1b57dd00d2c5e"],
                ["0x0000000000000000000000000000000000000000000000000000000000000009", "0x0000000000000000000000000000000000000000000000000000000000000001"],
                    {from: ownerAddress}
                )
            );
        });

        // using false-proof.json from 24**2 == 600 (incorrect)
        // but with input as true (0x000...01) instead of false (0x000...00)
        it('should not mint token using incorrect proof', async () => {
            let tokenId = 11;
            await truffleAssert.reverts(
                this.contract.mintUREMToken(
                    randomAcc,
                    tokenId,
                      ["0x1e8d756b4c31ae22326b587d569feac78a23ec7a9c3876c59ddca6a68e976c64", "0x23cef095ac2ba68ad1818af4030f9592594475ec8f9c2e25dc2ac79c01730169"],
                [["0x14e4b702eca9f62fea74a0044bd9e98d59e837397f3aa06654ac77293479050a", "0x0ff4c97f35b5265a35d14b41ac8810ac17c38580802f74dbc72fd73e80ec63e0"], ["0x20b42b9cc8aab96c5817452179d40de49bb49c988b06278195b9c1b7981aebe1", "0x08f8bdf850e91cd073cd5b02ee4d4a6fdc0695653e74e0c510488f98aa95d114"]],
                ["0x1ee25060c69eec2861b3a17eb705c28151708e71939b8cb2935c2dc6e82020f9", "0x2bf819edf4f0b7c58c07b16728b9b30d2ca1451afda66ff673d1b57dd00d2c5e"],
                    ["0x0000000000000000000000000000000000000000000000000000000000000258", "0x0000000000000000000000000000000000000000000000000000000000000001"],
                    {from: ownerAddress}
                )
            );
            let _ownerAddress = await this.contract.ownerOf.call(randomAcc);
            assert.equal(
                _ownerAddress, "0x0000000000000000000000000000000000000000",
                "Should not assign ownerAddress if incorrect proof given"
            );
            let bal = await this.contract.balanceOf.call(randomAcc);
            assert.equal(bal, 0, "Incorrect balance for randomAcc after invalid mint");
        });
    });
});
