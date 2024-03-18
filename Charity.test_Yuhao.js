const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Charity Contract", function () {
  let charity, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Charity = await ethers.getContractFactory("Charity");
    charity = await Charity.deploy();
  });

  describe("createProgram", function () {
    it("should create a program", async function () {
      const receiverAddress = owner.address;
      const title = "Program 1";
      const description = "Description for Program 1";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      await charity.createProgram(receiverAddress, title, description, image, deadline);

      const program = await charity.programs(owner.address);
      expect(program.title).to.equal(title);
      expect(program.description).to.equal(description);
      expect(program.image).to.equal(image);
      expect(program.deadline).to.equal(deadline);
      expect(program.active).to.be.true;
    });

    it("should not create a program with invalid receiver address", async function () {
      const title = "Program 1";
      const description = "Description for Program 1";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const emptyAddress="0x0000000000000000000000000000000000000000";
      await expect(charity.createProgram(emptyAddress, title, description, image, deadline)).to.be.revertedWith("Invalid receiver address");
    });
    
    it("Title is required!", async function () {
      const title = "";
      const description = "Description for Program 1";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const receiverAddress=owner.address;
      await expect(charity.createProgram(owner.address, title, description, image, deadline)).to.be.revertedWith("Title is required");
    });
    
    it("Description is required!", async function () {
      const title = "Program 1";
      const description = "";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const receiverAddress=owner.address;
      await expect(charity.createProgram(owner.address, title, description, image, deadline)).to.be.revertedWith("Description is required");
    });

    it("Deadline should be in the future!", async function () {
      const title = "Program 1";
      const description = "Description";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) - 3600; // 1 hour before now
      const receiverAddress=owner.address;
      await expect(charity.createProgram(owner.address, title, description, image, deadline)).to.be.revertedWith("Deadline should be in the future");
    });


    // Add more test cases for createProgram function
  });

  describe("sendDonation", function () {
    it("should transfer donation to receiver successfully", async function () {
      const title = "Program 1";
      const description = "Description for Program 1";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const donor = addr1;
      const donationAmount = ethers.parseEther("1");
      
      await charity.createProgram(owner.address, title, description, image, deadline);
      await charity.connect(donor).sendDonation(addr2.address, {value: donationAmount })

      const program = await charity.programs(owner.address);
      expect(program.collectedAmount).to.equal(donationAmount);
      expect(program.donations.length).to.equal(1);
      expect(program.donations[0].donor).to.equal(addr1.address);
      expect(program.donations[0].amount).to.equal(donationAmount);
    });

    // Add more test cases for sendDonation function
  });

  describe("completeProgram", function () {
    // Test cases for completeProgram function
  });

  describe("cancelProgram", function () {
    // Test cases for cancelProgram function
  });

  describe("getAllPrograms", function () {
    // Test cases for getAllPrograms function
  });

  describe("getDonations", function () {
    // Test cases for getDonations function
  });
});
