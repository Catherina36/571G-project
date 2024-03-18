const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Charity Contract", function () {
    let Charity;
    let charity;
    let owner;
    let donor;

    beforeEach(async () => {
        Charity = await ethers.getContractFactory("Charity");
        [owner, donor] = await ethers.getSigners();
        charity = await Charity.deploy();
    });

    it("Should revert if receiver address is invalid", async function () {
        await expect(
            charity.createProgram(
                ethers.constants.AddressZero,
                "Test Program",
                "Test Description",
                "Test Image",
                Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
            )
        ).to.be.revertedWith("Invalid receiver address");
    });

    it("Should revert if title is empty", async function () {
        await expect(
            charity.createProgram(
                owner.address,
                "",
                "Test Description",
                "Test Image",
                Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
            )
        ).to.be.revertedWith("Title is required");
    });

    it("Should revert if description is empty", async function () {
        await expect(
            charity.createProgram(
                owner.address,
                "Test Program",
                "",
                "Test Image",
                Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
            )
        ).to.be.revertedWith("Description is required");
    });

    it("Should revert if deadline is in the past", async function () {
        await expect(
            charity.createProgram(
                owner.address,
                "Test Program",
                "Test Description",
                "Test Image",
                Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
            )
        ).to.be.revertedWith("Deadline should be in the future");
    });

    it("Should revert if program is in progress", async function () {
        await charity.createProgram(
            owner.address,
            "Test Program",
            "Test Description",
            "Test Image",
            Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        );
        await expect(
            charity.createProgram(
                owner.address,
                "New Program",
                "New Description",
                "New Image",
                Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
            )
        ).to.be.revertedWith("Program is in progress");
    });

    it("Should revert if donation amount is less than 1 wei", async function () {
        await expect(
            charity.connect(donor).sendDonation(owner.address, { value: 0 })
        ).to.be.revertedWith("Donation amount should be greater than 1 wei");
    });

    it("Should revert if program is invalid", async function () {
        await charity.createProgram(
            owner.address,
            "Test Program",
            "Test Description",
            "Test Image",
            Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        );
        await charity.completeProgram();
        await expect(
            charity.connect(donor).sendDonation(owner.address, { value: ethers.parseEther("2") })
        ).to.be.revertedWith("Program is invalid");
    });

    it("Should revert if program has finished", async function () {
        await charity.createProgram(
            owner.address,
            "Test Program",
            "Test Description",
            "Test Image",
            Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
        );
        await expect(
            charity.connect(donor).sendDonation(owner.address, { value: ethers.parseEther("2") })
        ).to.be.revertedWith("Program has finished");
    });

    it("Should revert if deadline has passed", async function () {
        await charity.createProgram(
            owner.address,
            "Test Program",
            "Test Description",
            "Test Image",
            Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
        );
        await expect(
            charity.connect(donor).sendDonation(owner.address, { value: ethers.parseEther("2") })
        ).to.be.revertedWith("Deadline has passed");
    });
});
