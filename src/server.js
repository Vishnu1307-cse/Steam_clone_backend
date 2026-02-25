import dotenv from "dotenv";
dotenv.config();
import { transporter } from "./config/mail.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB();


transporter.verify((error, success) => {
  if (error) {
    console.error("Mail server error:", error);
  } else {
    console.log("Mail server ready to send emails");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
