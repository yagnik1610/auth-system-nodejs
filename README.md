# 🔐 Auth System (Node.js)

A complete backend authentication system with OTP verification, JWT authentication, and Gmail OAuth2 email integration.

---

## 🚀 Features

* 🔑 JWT Authentication
* 🔄 Refresh Token System
* 📧 OTP Email Verification (Gmail OAuth2)
* 🧠 Session Management
* 🚪 Logout & Logout from All Devices
* 🔒 Secure Password Handling (SHA256 - can be upgraded to bcrypt)

---

## 🛠 Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)
* Nodemailer
* Google OAuth2
* JSON Web Token (JWT)

---

## 📁 Project Structure

```bash
auth-system-nodejs/
│── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── config/
│
│── server.js
│── package.json
│── .gitignore
```

---

## 📦 Installation & Setup

```bash
# Clone repository
git clone https://github.com/yagnik1610/auth-system-nodejs.git

# Go to project folder
cd auth-system-nodejs

# Install dependencies
npm install

# Run server
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in root directory:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_USER=your_email@gmail.com
```

---

## 📌 API Endpoints

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | /api/auth/register      | Register user & send OTP |
| POST   | /api/auth/verify-email  | Verify OTP               |
| POST   | /api/auth/login         | Login user               |
| POST   | /api/auth/refresh-token | Get new access token     |
| POST   | /api/auth/logout        | Logout                   |
| POST   | /api/auth/logout-all    | Logout from all devices  |

---

## 🔄 Authentication Flow

1. User registers
2. OTP is sent via email
3. User verifies email using OTP
4. User logs in
5. Access token + refresh token generated
6. Session stored in database

---

## 🔥 Future Improvements

* ⏱ OTP Expiry
* 🔁 Resend OTP
* 🚫 Rate Limiting
* 🔐 Switch to bcrypt for password hashing
* 🎨 Frontend integration

---

## 👨‍💻 Author

**Yagnik Vithlani**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
