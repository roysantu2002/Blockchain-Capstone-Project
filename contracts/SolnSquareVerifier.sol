pragma solidity 0.5.11;

import {ERC721Mintable} from "./ERC721MintableComplete.sol";

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is ERC721Mintable {
    // TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
    SquareVerifier verifierContract;

    constructor(address verifierAddress) public {
        verifierContract = SquareVerifier(verifierAddress);
    }

    // TODO define a solutions struct that can hold an index & an address
    struct Solution {
        address toAddress;
        uint256 tokenIndex;
    }

    // TODO define an array of the above struct
    Solution[] submittedSolutions;

    // TODO define a mapping to store unique solutions submitted
    mapping(bytes32 => Solution) oneSolutions;

    // TODO Create an event to emit when a solution is added
    event SolutionAdded(
        address indexed toAddress,
        uint256 indexed tokenIndex,
        bytes32 indexed key
    );

    // TODO Create a function to add the solutions to the array and emit the event
    function addupSolutions(
        address toAddress,
        uint256 tokenIndex,
        bytes32 key
    ) internal {
        Solution memory soln = Solution({tokenId: tokenIndex, to: toAddress});
        submittedSolutions.push(soln);
        oneSolutions[key] = soln;
        emit SolutionAdded(toAddress, tokenIndex, key);
    }

    // TODO Create a function to mint new NFT only after the solution has been verified

    function mintUREMTokenoken(
        address toAddress,
        uint256 tokenIndex,
        uint256[2] memory _one,
        uint256[2][2] memory _two,
        uint256[2] memory _out,
        uint256[2] memory input
    ) public whenNotPaused {
        bytes32 _outKey = keccak256(abi.encodePacked(_one, _two, _out, input));
        require(
            oneSolutions[_outKey].to == address(0),
            "Solution is already used"
        );
        require(
            verifierContract.verifyTx(_one, _two, _out, input),
            "Solution is incorrect"
        );
        addupSolutions(toAddress, tokenIndex, _outKey);
        super.mint(toAddress, tokenIndex);
    }
}

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
contract Verifier {
    function verifyTx(
        uint256[2] memory _one,
        uint256[2][2] memory _two,
        uint256[2] memory _out,
        uint256[2] memory input
    ) public returns (bool r);
}
