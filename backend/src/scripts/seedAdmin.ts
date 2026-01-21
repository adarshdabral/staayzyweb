import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/staayzy";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@staayzy.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Admin User";
    const adminPhone = process.env.ADMIN_PHONE || "1234567890";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists. Updating password...");
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash(adminPassword, salt);
      existingAdmin.role = "admin";
      await existingAdmin.save();
      
      console.log("Admin password updated successfully!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Referral Code: ${existingAdmin.referralCode}`);
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const admin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        phone: adminPhone,
        role: "admin",
        referralCode: "ADMIN" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      });

      await admin.save();

      console.log("Admin user created successfully!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Referral Code: ${admin.referralCode}`);
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();


