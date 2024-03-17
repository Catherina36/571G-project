// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Charity {
    struct Donation {
        address donator;
        uint amount;
    }

    struct Program {
        string title;
        string description;
        uint targetAmount;
        uint collectedAmount;
        uint deadline;
        Donation[] donations;
    }

    struct ProgramInfo {
        string title;
        string description;
        uint targetAmount;
        uint collectedAmount;
        uint deadline;
    }

    mapping(address => Program) public programs;
    address[] public addresses;

    event ReceiverAdded(address receiverAddress, uint targetAmount);
    event DonationMade(
        address donatorAddress,
        address receiverAddress,
        uint amount
    );

    /**
     * Create a program
     */
    function createProgram(
        address receiverAddress,
        string memory title,
        string memory description,
        uint deadline
    ) public {
        // Validate arguments
        require(receiverAddress != address(0), "Invalid receiver address");
        require(bytes(title).length > 0, "Title is required");
        require(bytes(description).length > 0, "Description is required");
        require(deadline > block.timestamp, "Deadline should be in the future");

        // Validate the program receiver
        (bool isValidReceiver, uint targetAmount) = validateReceiver(
            receiverAddress
        );
        require(isValidReceiver, "Invalid receiver");
        require(targetAmount > 0, "Target amount should be greater than zero");

        // Create a program if the previous program has finished
        Program storage program = programs[receiverAddress];
        require(
            program.collectedAmount >= program.targetAmount ||
                block.timestamp >= program.deadline,
            "Program is in progress"
        );
        program.title = title;
        program.description = description;
        program.targetAmount = targetAmount;
        program.collectedAmount = 0;
        program.deadline = deadline;
        addresses.push(receiverAddress);

        emit ReceiverAdded(receiverAddress, targetAmount);
    }

    /**
     * Send donation method.
     * Check the remaining balance of receiver, return excessive money to donator.
     * Then send the donation to the receiver
     */
    function sendDonation(address receiverAddress) public payable {
        require(msg.value >= 1, "Donation amount should be greater than 1 wei");
        require(receiverAddress != address(0), "Invalid receiver");

        // Deny donation if targetAmount has been reached or deadline has passed
        Program storage program = programs[receiverAddress];
        require(
            program.collectedAmount < program.targetAmount,
            "Program has finished"
        );
        require(block.timestamp < program.deadline, "Deadline has passed");

        // Transfer excess amount back to donator
        address donatorAddress = msg.sender;
        uint donationAmount = msg.value;
        uint receiverBalance = program.targetAmount - program.collectedAmount;
        if (donationAmount > receiverBalance) {
            uint excessAmount = donationAmount - receiverBalance;
            payable(msg.sender).transfer(excessAmount);
            donationAmount = receiverBalance;
        }

        // Transfer donation amount to receiver
        payable(receiverAddress).transfer(donationAmount);
        program.collectedAmount += donationAmount;
        program.donations.push(Donation(donatorAddress, donationAmount));

        emit DonationMade(donatorAddress, receiverAddress, donationAmount);
    }

    function getAllPrograms() public view returns (ProgramInfo[] memory) {
        ProgramInfo[] memory allPrograms = new ProgramInfo[](addresses.length);
        for (uint i = 0; i < addresses.length; i++) {
            Program storage program = programs[addresses[i]];
            allPrograms[i] = ProgramInfo(
                program.title,
                program.description,
                program.targetAmount,
                program.collectedAmount,
                program.deadline
            );
        }
        return allPrograms;
    }

    function getDonations(
        address receiverAddress
    ) public view returns (Donation[] memory) {
        require(receiverAddress != address(0), "Invalid receiver");
        return programs[receiverAddress].donations;
    }

    function validateReceiver(
        address receiverAddress
    ) private pure returns (bool, uint) {
        return (true, 100);
    }
}
