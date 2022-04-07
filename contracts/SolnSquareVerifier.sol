pragma solidity 0.5.11;

import "./ERC721MintableComplete.sol";

// 2. TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is ERC721MintableComplete {
 SquareVerifier verifierContract;

    // 3. TODO define a solutions struct that can hold an index & an address
    struct Solutions {
        uint256 solutionIndex;
        address solutionAddress;
    }

    // 4. TODO define an array of the above struct
    Solutions[] submittedSolutions;

    // 5. TODO define a mapping to store unique solutions submitted
    mapping (bytes32 => Solutions) oneSolutions;

    // 6. TODO Create an event to emit when a solution is added
       event SolutionAdded(
        address indexed to,
        uint256 indexed tokenId,
        bytes32 indexed key
    );

    // 7. TODO Create a function to add the solutions to the array and emit the event
      function addupSolutions(address _to, uint256 _tokenId, bytes32 _key)
        internal
    {
        Solutions memory _soln = Solutions({solutionIndex : _tokenId, solutionAddress : _to});
        submittedSolutions.push(_soln);
        oneSolutions[_key] = _soln;
        emit SolutionAdded(_to, _tokenId, _key);
    }

    // 8. TODO Create a function to mint new NFT only after the solution has been verified
    //      - make sure the solution is unique (has not been used before)
    //      - make sure you handle metadata as well as tokenSuplly
      function mintUREMToken(
        address to,
        uint256 tokenId,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    )
        public
        whenNotPaused
    {
        bytes32 key = keccak256(abi.encodePacked(a, b, c, input));
        // require(oneSolutions[key].to == address(0), "Solution is already used");
        require(verifierContract.verifyTx(a, b, c, input), "Solution is incorrect");
        addupSolutions(to, tokenId, key);
        super.mint(to, tokenId);
    }
}

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
contract SquareVerifier {
    function verifyTx(
      uint[2] memory a,
      uint[2][2] memory b,
      uint[2] memory c,
      uint[2] memory input
    )
    public
    returns
    (bool r);
}










