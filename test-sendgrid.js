import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

console.log("Script starting...");

dotenv.config();
console.log("Dotenv configured.");

const apiKey = process.env.SENDGRID_API_KEY;
console.log("API Key found:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");

if (!apiKey) {
    console.error("Error: SENDGRID_API_KEY not found in .env");
    process.exit(1);
}

sgMail.setApiKey(apiKey);

const msg = {
    to: "svvishnu33@gmail.com",
    from: "anonymousforuse33@gmail.com",
    subject: "SendGrid Debug Test",
    text: "Testing SendGrid connection and delivery.",
};

console.log("Attempting to send...");
try {
    const response = await sgMail.send(msg);
    console.log("Success! Status:", response[0].statusCode);
} catch (error) {
    console.error("Error occurred:");
    if (error.response) {
        console.error(JSON.stringify(error.response.body, null, 2));
    } else {
        console.error(error.message);
    }
}
console.log("Script finished.");
