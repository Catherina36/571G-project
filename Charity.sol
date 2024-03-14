// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Charity {
    struct Donation {
        string donatorName;
        uint256 amount;
    }

    struct Program {
        address owner;
        string title;
        string description;
        uint256 targetAmount;
        uint256 collectedAmount;
        uint256 deadline;
        string image;
        Donation[] donations;
    }

    mapping(string => address) public nameToAddress;
    mapping(address => Program) public addressToProgram;

    event ReceiverAdded(string name, address receiverAddress, uint256 maxAmount);
    event DonationMade(string donatorName, address receiverAddress, uint256 amount);

    /**
     * Add receiver method
     * Invoke another contract that returns if the receiver is valid and how much it can receive
     * If the receiver has no program, create a program for it.
     * If it has a program, update the program's details if needed.
     */
    function addReceiver(
        string memory name,
        address receiverAddress,
        string memory title,
        string memory description,
        uint256 targetAmount,
        uint256 deadline,
        string memory image
    ) public {
        require(receiverAddress != address(0), "Invalid receiver address");
        require(bytes(name).length > 0, "Name is required");
        require(bytes(title).length > 0, "Title is required");
        require(bytes(description).length > 0, "Description is required");
        require(targetAmount > 0, "Target amount should be greater than zero");
        require(deadline > block.timestamp, "Deadline should be in the future");

        // Invoke another contract to validate the receiver
        // Assuming the contract returns true if the receiver is valid
        bool isValidReceiver = validateReceiver(receiverAddress);
        require(isValidReceiver, "Invalid receiver");

        nameToAddress[name] = receiverAddress;

        Program storage program = addressToProgram[receiverAddress];
        if (program.owner == address(0)) {
            // Create a new program
            program.owner = receiverAddress;
            program.title = title;
            program.description = description;
            program.targetAmount = targetAmount;
            program.deadline = deadline;
            program.image = image;
        } else {
            // Update the existing program
            program.title = title;
            program.description = description;
            program.targetAmount = targetAmount;
            program.deadline = deadline;
            program.image = image;
        }

        emit ReceiverAdded(name, receiverAddress, targetAmount);
    }

    /**
     * Send donation method.
     * Check the remaining balance of receiver, return excessive money.
     * Then send the donation to the receiver
     */
    function sendDonation(string memory donatorName, string memory receiverName) public payable {
        require(bytes(donatorName).length > 0, "Donator name is required");
        require(bytes(receiverName).length > 0, "Receiver name is required");
        require(msg.value > 0.00000001, "Donation amount should be greater than zero");

        address receiverAddress = nameToAddress[receiverName];
        require(receiverAddress != address(0), "Invalid receiver name");

        uint256 maxAmount = addressToProgram[receiverAddress].targetAmount;
        uint256 donationAmount = msg.value;

        if (donationAmount > maxAmount - addressToProgram[receiverAddress].collectedAmount) {
            uint256 excessAmount = donationAmount - (maxAmount - addressToProgram[receiverAddress].collectedAmount);
            payable(msg.sender).transfer(excessAmount);
            donationAmount = maxAmount - addressToProgram[receiverAddress].collectedAmount;
        }

        addressToProgram[receiverAddress].collectedAmount += donationAmount;
        addressToProgram[receiverAddress].donations.push(Donation(donatorName, donationAmount));
        payable(receiverAddress).transfer(donationAmount);

        emit DonationMade(donatorName, receiverAddress, donationAmount);
    }

    function getAllPrograms() public view returns (Program[] memory) {
        Program[] memory programs = new Program[](nameToAddress.length);
        uint256 index = 0;
        for (address receiverAddress : nameToAddress) {
            programs[index] = addressToProgram[receiverAddress];
            index++;
        }
        return programs;
    }

    function getDonations(address receiverAddress) public view returns (Donation[] memory) {
        return addressToProgram[receiverAddress].donations;
    }

    function validateReceiver(address receiverAddress) private pure returns (bool) {
        // Implement the actual validation logic here
        return true;
    }
}
