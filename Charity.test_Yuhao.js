const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Charity Contract", function () {
  let Charity, charity, owner, donor;

  beforeEach(async function () {
    [owner, donor] = await ethers.getSigners();

    const Charity = await ethers.getContractFactory("Charity");
    charity = await Charity.deploy();
  });

  describe("createProgram", function () {
  
    it("should create a new program", async function () {
    const title = "Program Title";
    const description = "Program Description";
    const image = "image.png";
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    await expect(charity.createProgram(title, description, image, deadline)
    ).to.emit(charity, "ReceiverAdded").withArgs(owner.address, 100); // Assuming targetAmount is 100
    await charity.completeProgram();

    await charity.createProgram("t2","d2","i2.png",deadline+3600);
    //await charity.completeProgram();
    
    //await charity.createProgram("t3","d3","i3",deadline+7200);
    
    const programs = await charity.getAllPrograms();
    //console.log(programs);
    expect(programs.length).to.equal(2);
    expect(programs[1].title).to.equal("t2");
    expect(programs[1].description).to.equal("d2");
    expect(programs[1].image).to.equal("i2.png");
    expect(programs[1].deadline).to.equal(deadline+3600);
    expect(programs[1].active).to.be.true;
    });


    it("should not create a program with invalid arguments", async function () {
    await expect(charity.createProgram("", "Description", "image.png", Math.floor(Date.now() / 1000) + 3600)
    ).to.be.revertedWith("Title is required");

    await expect(charity.createProgram("Title", "", "image.png", Math.floor(Date.now() / 1000) + 3600)
    ).to.be.revertedWith("Description is required");

    await expect(charity.createProgram("Title", "Description", "image.png", Math.floor(Date.now() / 1000)-3600)
    ).to.be.revertedWith("Deadline should be in the future");
    });
    
    it("should not create a program if one is already active", async function () {
    const title = "Program Title";
    const description = "Program Description";
    const image = "image.png";
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    await charity.createProgram(title, description, image, deadline);

    await expect(
      charity.createProgram(title, description, image, deadline+3600)
    ).to.be.revertedWith("Program is in progress");
  });    
 });
 
 
  describe("completeProgram", function () {
    it("should complete program and emit event", async function () {
    
      const title = "Program 1";	
      const description = "Description for Program 1";
      const image = "image.png";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      await charity.createProgram(title, description, image, deadline);
      
      donationAmount = ethers.parseUnits("1","wei");
      await charity.sendDonation(owner.address, {value:donationAmount});
      
    // 完成项目
      const tx = await charity.completeProgram();

    // 确认事件被触发
      await expect(tx).to.emit(charity, "programCompleted").withArgs(owner.address, donationAmount);

    // 确认项目状态已经更新
    const programs = await charity.getAllPrograms();
    console.log(programs);
    //const program = await charity.programs(owner.address);
    expect(programs[0].active).to.be.false;
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
    await charity.createProgram(title, description, image, deadline);

    // 取消项目
    donationAmount = ethers.parseUnits("1","wei");
    await charity.connect(donor).sendDonation(owner.address, {value:donationAmount});
    returnAmount = donationAmount;
    const tx = await charity.cancelProgram({value: returnAmount})
    await expect(tx).to.emit(charity,'programCanceled').withArgs(owner.address, 0);

    // 断言项目状态为非活动状态
    const programs = await charity.getAllPrograms();
    expect(programs[0].active).to.be.false;
    });
  });

  describe("getAllPrograms", function () {
    // Test cases for getAllPrograms function
    it("should return all programs", async function () {
    const title = "Program 1";	
    const description = "Description for Program 1";
    const image = "image.png";
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    await charity.createProgram(title, description, image, deadline);
    await charity.completeProgram();
    await charity.createProgram("Program2", "description for 2", image, deadline);
    
    const allPrograms = await charity.getAllPrograms();
    console.log(allPrograms);
    expect(allPrograms.length).to.equal(2);
    const count = await charity.getAllProgramsCount();
    });
  });

  describe("getDonations", function () {
    // Test cases for getDonations function
    it("should return donations for a valid receiver", async function () {
    const title = "Program 1";	
    const description = "Description for Program 1";
    const image = "image.png";
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    await charity.createProgram(title, description, image, deadline);
    await charity.completeProgram();
    await charity.createProgram("t2", "d2", "i2.png", deadline+3600);
    const Programs = await charity.getAllPrograms();
    expect(Programs[0].index).to.equal(0);
    expect(Programs[0].receiverAddress).to.equal(owner.address);
    //写两个，期待index和地址与...相同 owner.address, 0和1
    expect(Programs[1].index).to.equal(1);
    expect(Programs[0].receiverAddress).to.equal(owner.address);
    });
  });
  
  describe("sendDonations",function (){
  
  it("Should send successfully", async function () {
        await charity.createProgram(
            "Test Program",
            "Test Description",
            "Test Image",
            Math.floor(Date.now() / 1000) + 3600 // 1 hour ago
        );
        //捐两笔
        
        donationAmount= ethers.parseUnits("1","wei");
        await charity.sendDonation(owner.address, { value:donationAmount});
        const Programs1 = await charity.getAllPrograms();
        const initialCollectedAmount = Programs1[Programs1.length-1].collectedAmount;
        console.log(initialCollectedAmount);
        await charity.sendDonation(owner.address, { value:donationAmount});
        expectedAmount=donationAmount+initialCollectedAmount;
        const Programs = await charity.getAllPrograms();
        console.log(expectedAmount);
        expect(Programs[Programs.length-1].collectedAmount).to.equal(expectedAmount);
        
    });
  
  });
  
  

 
});
    
