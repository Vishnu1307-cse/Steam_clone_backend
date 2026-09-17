# Steam Clone Backend

A robust backend service built for a Steam-inspired gaming platform, featuring secure authentication, role-based access control, and an automated email notification system for admin workflows.

---

## 🚀 Tech Stack

* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Database & ODM:** MongoDB, Mongoose
* **Mailing Service:** Nodemailer (Gmail SMTP integration)
* **Security & Auth:** JSON Web Tokens (JWT), bcrypt.js

---

## ✨ Features

* **User Authentication & Authorization:** Secure registration, login, and session management using hashed passwords and JWT.
* **Admin Approval Workflow:** Secure onboarding pipeline where administrative accounts require verification and approval requests.
* **Automated Email Notifications:** Integrated Nodemailer SMTP transporter configured with Gmail to send automated transaction and account approval emails.
* **Robust Error Handling:** Clean middleware architecture to manage ES module scoping, routing errors, and database connection exceptions.

---

## 📁 Project Structure

```text
Steam_clone_backend/
│
├── controllers/    # Business logic and request handlers
├── models/         # Mongoose database schemas (User, Game, etc.)
├── routes/         # Express API route endpoints
├── middleware/     # Auth and error-handling middleware
├── utils/          # Nodemailer and helper configurations
├── .env.example    # Environment variable template
├── server.js       # App entry point
└── package.json    # Dependencies and scripts
```

---

## 🛠️ Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB instance (Local or Atlas)
* A Gmail account with an App Password generated for SMTP mailing.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vishnu1307-cse/Steam_clone_backend.git
   cd Steam_clone_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and populate it with your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Run the server:**
   * Development mode (with nodemon):
     ```bash
     npm run dev
     ```
   * Production mode:
     ```bash
     npm start
     ```

---

## 🔌 API Endpoints (Overview)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT |
| `POST` | `/api/admin/approve` | Trigger admin approval email notification via Nodemailer |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
