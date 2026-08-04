// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GeoDAO is Ownable {
    IERC20 public governanceToken;
    uint256 public minimumQuorum = 1000 * 10**18; // Minimum tokens required to create a proposal
    
    struct Proposal {
        uint256 id;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 endTime;
        bool executed;
        mapping(address => bool) voted;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public nextProposalId;

    event ProposalCreated(uint256 indexed id, string description, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id, bool passed);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        governanceToken = IERC20(_tokenAddress);
    }

    function createProposal(string memory description, uint256 votingPeriodSeconds) external {
        require(governanceToken.balanceOf(msg.sender) >= minimumQuorum, "Insufficient tokens to propose");

        uint256 proposalId = nextProposalId++;
        Proposal storage p = proposals[proposalId];
        p.id = proposalId;
        p.description = description;
        p.endTime = block.timestamp + votingPeriodSeconds;
        
        emit ProposalCreated(proposalId, description, p.endTime);
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp < p.endTime, "Voting ended");
        require(!p.voted[msg.sender], "Already voted");

        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        if (support) {
            p.yesVotes += weight;
        } else {
            p.noVotes += weight;
        }

        p.voted[msg.sender] = true;
        
        emit Voted(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp >= p.endTime, "Voting not ended yet");
        require(!p.executed, "Already executed");

        p.executed = true;
        bool passed = p.yesVotes > p.noVotes;
        
        emit ProposalExecuted(proposalId, passed);
    }
}
