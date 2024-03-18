// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Charity {
    struct Donation {
        address donor;
        uint amount;
    }

    struct Program {
        //address owner;
        string title;
        string description;
        uint targetAmount;
        uint collectedAmount;
        uint deadline;
        string image;
        Donation[] donations;
        bool active;
    }

    struct ProgramInfo {
        string title;
        string description;
        uint targetAmount;
        uint collectedAmount;
        string image;
        uint deadline;
        bool active;
    }

    mapping(address => Program) public programs;
    address[] public addresses;

    event ReceiverAdded(address receiverAddress, uint targetAmount);
    event DonationMade(
        address donorAddress,
        address receiverAddress,
        uint amount
    );
    event projectCompleted(address receiverAddress, uint amount);
    event projectCanceled(address receiverAddress, uint amount);
    event durationChanged(uint, uint);

    /**
     * Create a program
     */
    function createProgram(
        address receiverAddress,
        string memory title,
        string memory description,
        string memory image,
        //uint targetAmount,
        uint deadline
    ) public {
        // Validate arguments
        require(receiverAddress != address(0), "Invalid receiver address");
        require(bytes(title).length > 0, "Title is required");
        require(bytes(description).length > 0, "Description is required");
        require(block.timestamp < deadline, "Deadline should be in the future");

        // Validate the program receiver
        (bool isValidReceiver, uint targetAmount) = validateReceiver(
            receiverAddress
        );
        require(isValidReceiver, "Invalid receiver");
        require(targetAmount > 0, "Target amount should be greater than zero");

        // Validate that the program is not active
        Program storage program = programs[receiverAddress];
        require(
            !program.active || block.timestamp >= program.deadline,
            "Program is in progress"
        );

        // Create the program
        program.title = title;
        program.description = description;
        program.targetAmount = targetAmount;
        program.collectedAmount = 0;
        program.image = image;
        program.deadline = deadline;
        program.active = true;
        addresses.push(receiverAddress);

        emit ReceiverAdded(receiverAddress, targetAmount);
    }

    /**
     * Send donation to a program.
     */
    function sendDonation(address receiverAddress) public payable {
        require(msg.value >= 1, "Donation amount should be greater than 1 wei");
        require(receiverAddress != address(0), "Invalid receiver");

        // Deny donation if targetAmount has been reached or deadline has passed
        Program storage program = programs[receiverAddress];
        require(program.active, "Program is not active");
        require(block.timestamp < program.deadline, "Deadline has passed");

        // Transfer excessive amount back to donor
        address donorAddress = msg.sender;
        uint donationAmount = msg.value;
        uint receiverBalance = program.targetAmount - program.collectedAmount;
        if (donationAmount > receiverBalance) {
            uint excessAmount = donationAmount - receiverBalance;
            payable(msg.sender).transfer(excessAmount);
            donationAmount = receiverBalance;
            // program deactivates when targetAmount is collected
            program.active = false;
        }

        // Transfer donation amount to receiver
        payable(receiverAddress).transfer(donationAmount);
        program.collectedAmount += donationAmount;
        program.donations.push(Donation(donorAddress, donationAmount));

        emit DonationMade(donorAddress, receiverAddress, donationAmount);
    }

    /**
     * To end a program before its deadline
     */
    function completeProgram() public returns (bool succ) {
        Program storage program = programs[msg.sender];
        require(program.active, "Program is not active");
        require(block.timestamp < program.deadline, "Deadline has passed");

        program.active = false;
        emit projectCompleted(msg.sender, program.collectedAmount);
        return true;
    }

    /**
     * To cancel a program before its deadline and return money back to donors
     */
    function cancelProgram() public returns (bool succ) {
        // Validate receiver is in addresses

        Program storage program = programs[msg.sender];
        require(block.timestamp < program.deadline, "Deadline has passed");

        // !!! can not directly use program.donations because it includes donations
        // in previous programs

        uint donorsNumber = program.donations.length;
        for (uint i = 0; i < donorsNumber; i++) {
            address donor = program.donations[i].donor;
            uint value = program.donations[i].amount;
            //refund to donors
            payable(donor).transfer(value);
        }
        program.active = false;
        emit projectCanceled(msg.sender, program.collectedAmount);
        return true;
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
                program.image,
                program.deadline,
                program.active
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
