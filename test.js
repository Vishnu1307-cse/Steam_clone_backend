import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Initialize dotenv
dotenv.config();

async function testConnection() {
    console.log("1. Loading credentials...");
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.error("❌ Error: Credentials missing from .env file.");
        console.log(`   User found: ${user ? 'Yes' : 'No'}`);
        console.log(`   Pass found: ${pass ? 'Yes' : 'No'}`);
        return;
    }

    console.log(`   User: ${user}`);
    console.log("2. Creating transporter...");

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass 
        }
    });

    try {
        console.log("3. Verifying SMTP connection...");
        await transporter.verify();
        console.log("✅ SMTP Connection Successful!");

        console.log("4. Attempting to send test email...");
        const info = await transporter.sendMail({
            from: `"Test Script" <${user}>`, 
            to: user, 
            subject: "Nodemailer Test ✔", 
            text: "It works!", 
        });

        console.log("✅ Message sent: %s", info.messageId);

    } catch (error) {
        console.error("❌ Connection Failed!");
        console.error(error);
    }
}

testConnection();