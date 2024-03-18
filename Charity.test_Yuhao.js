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
      const donationAmount = ethers.parseEther("1");
      
      await charity.createProgram(owner.address, title, description, image, deadline);
      await charity.createProgram(addr1.address, title, description, image, deadline);
      await charity.sendDonation(addr1.address, {value: donationAmount })
      
      const program = await charity.programs(owner.address);
    });
    
    it("should transfer donation more than 1", async function () {
      const title = "Program 1";
      const description = "Description for Program 1";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const emptyAddress="0x0000000000000000000000000000000000000000";
      console.log(ethers.parseEther("1"));
      const donationAmount = ethers.parseEther("0");
      console.log(donationAmount);
      await charity.createProgram(owner.address, title, description, image, deadline);
      await charity.createProgram(addr1.address, title, description, image, deadline);
      await expect(charity.sendDonation(addr1.address, {value: donationAmount })).to.be.revertedWith("Donation amount should be greater than 1 wei");
      
      
      const program = await charity.programs(owner.address);
    });

    it("should be valid receiver", async function () {
      const title = "Program 1";
      const description = "Description for Program 1";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const emptyAddress="0x0000000000000000000000000000000000000000";
      const donationAmount = ethers.parseEther("0");
      await charity.createProgram(owner.address, title, description, image, deadline);
      await charity.createProgram(emptyAddress, title, description, image, deadline);
      await expect(charity.sendDonation(emptyAddr.ess, {value: donationAmount })).to.be.revertedWith("Invalid receiver");
      
      
      const program = await charity.programs(owner.address);
    });

    // Add more test cases for sendDonation function
  });

  describe("completeProgram", function () {
    it("should complete program and emit event", async function () {
    
      const title = "Program 1";	
      const description = "Description for Program 1";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      await charity.createProgram(owner.address, title, description, image, deadline);

    // 完成项目
      const tx = await charity.completeProgram();

    // 确认事件被触发
      await expect(tx).to.emit(charity, "projectCompleted").withArgs(owner.address, 0);

    // 确认项目状态已经更新
    const program = await charity.programs(owner.address);
    expect(program.active).to.be.false;
  });

    // Test cases for completeProgram function
  });

  describe("cancelProgram", function () {
    // Test cases for cancelProgram function
    it("should cancel the program and refund donors", async function () {
    // 创建一个新的项目
    const title = "Program 1";	
    const description = "Description for Program 1";
    const image = "image.png";
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    await charity.createProgram(owner.address, title, description, image, deadline);

    // 取消项目
    const tx = await charity.cancelProgram()
    await expect(tx).to.emit(charity,'projectCanceled').withArgs(owner.address, 0);

    // 断言项目状态为非活动状态
    const program = await charity.programs(owner.address);
    expect(program.active).to.be.false;
  });
    
  });

  describe("getAllPrograms", function () {
    // Test cases for getAllPrograms function
    it("should return all programs", async function () {
    const title = "Program 1";	
    const description = "Description for Program 1";
    const image = "image.png";
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    await charity.createProgram(owner.address, title, description, image, deadline);
    await charity.createProgram(addr1.address, "Program2", "description for 2", image, deadline);
    const allPrograms = await charity.getAllPrograms();
    expect(allPrograms.length).to.equal(2);
    
    
    });
    
    
  });

  describe("getDonations", function () {
    // Test cases for getDonations function
    it("should return donations for a valid receiver", async function () {
    const title = "Program 1";	
    const description = "Description for Program 1";
    const image = "image.png";
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    await charity.createProgram(owner.address, title, description, image, deadline);
    const donations = await charity.getDonations(owner.address);
    console.log(donations);
    expect(donations).to.not.be.empty;
    });
  });
});
