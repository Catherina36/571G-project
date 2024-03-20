// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Charity {
    struct Donation {
        address donor;
        uint amount;
    }

    struct Program {
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
        address receiverAddress;
        uint index;
        string title;
        string description;
        uint targetAmount;
        uint collectedAmount;
        string image;
        uint deadline;
        bool active;
    }

    mapping(address => Program[]) public programs;
    address[] public addresses;

    event ReceiverAdded(address receiverAddress, uint targetAmount);
    event DonationMade(
        address donorAddress,
        address receiverAddress,
        uint amount
    );
    event programCompleted(address receiverAddress, uint amount);
    event programCanceled(address receiverAddress, uint amount);
    event durationChanged(uint, uint);

    /**
     * Create a program
     */
    function createProgram(
        string memory title,
        string memory description,
        string memory image,
        uint deadline
    ) public {
        // Validate arguments
        address receiverAddress = msg.sender;
        require(msg.sender != address(0), "Invalid receiver address");
        require(bytes(title).length > 0, "Title is required");
        require(bytes(description).length > 0, "Description is required");
        require(block.timestamp < deadline, "Deadline should be in the future");

        // Validate the program receiver
        (bool isValidReceiver, uint targetAmount) = validateReceiver(
            msg.sender
        );
        require(isValidReceiver, "Invalid receiver");
        require(targetAmount > 0, "Target amount should be greater than zero");

        // Validate that the last program is not active
        Program[] storage programArray = programs[msg.sender];
        if (programArray.length > 0) {
            Program storage lastProgram = programArray[programArray.length - 1];
            require(
                !lastProgram.active || block.timestamp >= lastProgram.deadline,
                "Program is in progress"
            );
        }

        // Create a new program
        Program memory newProgram = Program(
            title,
            description,
            targetAmount,
            0,
            deadline,
            image,
            new Donation[](0),
            true // active: true
        );
        programArray.push(newProgram);
        addresses.push(msg.sender);

        emit ReceiverAdded(receiverAddress, targetAmount);
    }

    /**
     * Send donation to a program.
     */
    function sendDonation(address receiverAddress) public payable {
        require(msg.value >= 1, "Donation amount should be greater than 1 wei");
        require(receiverAddress != address(0), "Invalid receiver");

        // Validate that the program is active
        Program[] storage programArray = programs[receiverAddress];
        require(programArray.length > 0, "No program");
        Program storage program = programArray[programArray.length - 1];
        require(program.active, "Program is not active");
        require(block.timestamp < program.deadline, "Deadline has passed");

        // Transfer amount exceeding targetAmount back to donor
        address donorAddress = msg.sender;
        uint donationAmount = msg.value;
        uint receiverBalance = program.targetAmount - program.collectedAmount;
        if (donationAmount > receiverBalance) {
            uint excessAmount = donationAmount - receiverBalance;
            payable(msg.sender).transfer(excessAmount);
            donationAmount = receiverBalance;
            program.active = false; // program deactivates
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
        Program[] storage programArray = programs[msg.sender];
        require(programArray.length > 0, "No program");
        Program storage program = programArray[programArray.length - 1];
        require(program.active, "Program is not active");
        require(block.timestamp < program.deadline, "Deadline has passed");

        program.active = false;
        emit programCompleted(msg.sender, program.collectedAmount);
        return true;
    }

    /**
     * To cancel a program before its deadline and return money back to donors
     */
    function cancelProgram() public returns (bool succ) {
        Program[] storage programArray = programs[msg.sender];
        require(programArray.length > 0, "No program");
        Program storage program = programArray[programArray.length - 1];
        require(block.timestamp < program.deadline, "Deadline has passed");

        // xxxxxxxxxxxxxxxxxxxxxxxxxrefund to donors
        // the money has already be transfered to receivers. cannot refund
        for (uint i = 0; i < program.donations.length; i++) {
            address donor = program.donations[i].donor;
            uint value = program.donations[i].amount;
            payable(donor).transfer(value);
        }
        program.active = false;
        emit programCanceled(msg.sender, program.collectedAmount);
        return true;
    }

    /**
     * Get one program.
     */
    function getProgram(
        address receiverAddress,
        uint index
    ) public view returns (ProgramInfo memory) {
        require(
            programs[receiverAddress].length > 0,
            "No programs for this address."
        );
        require(
            index < programs[receiverAddress].length,
            "Index out of bounds."
        );

        Program storage program = programs[receiverAddress][index];
        ProgramInfo memory programInfo = ProgramInfo(
            receiverAddress,
            index,
            program.title,
            program.description,
            program.targetAmount,
            program.collectedAmount,
            program.image,
            program.deadline,
            program.active
        );
        return programInfo;
    }

    function getAllProgramsCount() public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < addresses.length; i++) {
            count += programs[addresses[i]].length;
        }
        return count;
    }

    /**
     * Get all programs.
     */
    function getAllPrograms() public view returns (ProgramInfo[] memory) {
        ProgramInfo[] memory allPrograms = new ProgramInfo[](
            getAllProgramsCount()
        );
        uint counter = 0;

        for (uint i = 0; i < addresses.length; i++) {
            for (
                uint index = 0;
                index < programs[addresses[i]].length;
                index++
            ) {
                allPrograms[counter] = getProgram(addresses[i], index);
                counter++;
            }
        }
        return allPrograms;
    }

    /**
     * Get a program's donations.
     */
    function getDonations(
        address receiverAddress,
        uint index
    ) public view returns (Donation[] memory) {
        require(receiverAddress != address(0), "Invalid receiver");
        require(programs[receiverAddress].length > 0, "No program");
        require(
            index < programs[receiverAddress].length,
            "Index out of bounds"
        );

        Program storage program = programs[receiverAddress][index];
        uint len = program.donations.length;
        Donation[] memory donationArray = new Donation[](len);
        for (uint i = 0; i < len; i++) {
            donationArray[i] = program.donations[i];
        }

        return donationArray;
    }

    function validateReceiver(
        address receiverAddress
    ) private pure returns (bool, uint) {
        return (true, 100);
    }
}
