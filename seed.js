import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./src/models/User.js";
import SuperAdmin from "./src/models/SuperAdmin.js";
import Game from "./src/models/Game.js";
import { generateKeyPair, encryptPrivateKey } from "./src/utils/digitalSignature.js";

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB:", process.env.MONGO_URI || "mongodb://localhost:27017/steam_clone");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/steam_clone");
    console.log("Connected to MongoDB.");

    // Clean existing seed users if present
    await User.deleteMany({ email: { $in: ["svvishnu33@gmail.com", "employee@steam.com", "gamer1@steam.com"] } });
    await SuperAdmin.deleteMany({ email: "superadmin@steam.com" });

    // Helper for password hash
    const hashPassword = async (pwd) => await bcrypt.hash(pwd, 10);

    // 1. Create Main User Account requested by user
    const keys1 = generateKeyPair();
    const encryptedKey1 = encryptPrivateKey(keys1.privateKey);
    const mainUser = await User.create({
      username: "svvishnu33",
      email: "svvishnu33@gmail.com",
      passwordHash: await hashPassword("user"),
      role: "user",
      publicKey: keys1.publicKey,
      encryptedPrivateKey: encryptedKey1,
      isVerified: true
    });
    console.log("✅ Main User Created: svvishnu33@gmail.com / user");

    // 2. Create Additional Mock User Account
    const keys2 = generateKeyPair();
    const encryptedKey2 = encryptPrivateKey(keys2.privateKey);
    const gamerUser = await User.create({
      username: "CyberGamer99",
      email: "gamer1@steam.com",
      passwordHash: await hashPassword("password123"),
      role: "user",
      publicKey: keys2.publicKey,
      encryptedPrivateKey: encryptedKey2,
      isVerified: true
    });
    console.log("✅ Mock User Created: gamer1@steam.com / password123");

    // 3. Create Employee Account
    const keys3 = generateKeyPair();
    const encryptedKey3 = encryptPrivateKey(keys3.privateKey);
    const employeeUser = await User.create({
      username: "EmployeeAlex",
      email: "employee@steam.com",
      passwordHash: await hashPassword("employee123"),
      employeeId: "EMP-1001",
      role: "employee",
      publicKey: keys3.publicKey,
      encryptedPrivateKey: encryptedKey3,
      isVerified: true
    });
    console.log("✅ Employee Account Created: employee@steam.com / employee123");

    // 4. Create SuperAdmin Account
    const keys4 = generateKeyPair();
    const superAdmin = await SuperAdmin.create({
      username: "SuperAdminMaster",
      email: "superadmin@steam.com",
      passwordHash: await hashPassword("superadmin123"),
      employeeId: "SA-0001",
      role: "superadmin",
      publicKey: keys4.publicKey,
      privateKey: keys4.privateKey,
      digitalSignature: "INITIAL_SEED_SIGNATURE",
      isActive: true
    });
    console.log("✅ SuperAdmin Account Created: superadmin@steam.com / superadmin123");

    // 5. Seed Featured Sample Games
    await Game.deleteMany({ title: { $in: ["Cyberpunk 2077: Phantom Liberty", "Elden Ring", "Hades II", "Stardew Valley"] } });

    const games = [
      {
        title: "Cyberpunk 2077: Phantom Liberty",
        description: "Phantom Liberty is a new spy-thriller adventure for Cyberpunk 2077. Return as cyber-enhanced mercenary V and embark on a high-stakes mission of espionage and intrigue to save the NUSA President.",
        price: 1999,
        coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
        uploadedBy: employeeUser._id
      },
      {
        title: "Elden Ring",
        description: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
        price: 2499,
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
        uploadedBy: employeeUser._id
      },
      {
        title: "Hades II",
        description: "Battle beyond the Underworld using dark sorcery to take on the Titan of Time in this bewitching sequel to the award-winning rogue-like dungeon crawler.",
        price: 1299,
        coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80",
        uploadedBy: mainUser._id
      },
      {
        title: "Stardew Valley",
        description: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.",
        price: 479,
        coverImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
        uploadedBy: mainUser._id
      }
    ];

    await Game.insertMany(games);
    console.log("✅ Seeded Sample Steam Games into store!");

    console.log("\n==============================================");
    console.log("🎉 DB SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==============================================");
    console.log("Mock Credentials Summary:");
    console.log("1. User: svvishnu33@gmail.com | Password: user");
    console.log("2. User: gamer1@steam.com | Password: password123");
    console.log("3. Employee: employee@steam.com | Password: employee123");
    console.log("4. SuperAdmin: superadmin@steam.com | Password: superadmin123");
    console.log("==============================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedData();
