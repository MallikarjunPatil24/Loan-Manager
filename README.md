# Unnati Loan Services 🏦

Empowering Growth, One Loan at a Time. A minimal, full-stack Loan Management Web Application built for banks and NBFCs.

---

## 🚀 Features

- **JWT-Based Authentication**: Hashed password storage with Role-based authorization.
- **Client Workspace**: Apply for loans, track status, generate repayment schedules, and review transaction logs.
- **Bank Manager Portal**: Review pending applications, approve with automated EMI calculations, reject with remarks, and record customer repayments.
- **EMI Logic**: Reducing Balance Method computed programmatically.

---

## 🗂️ Tech Stack

- **Frontend**: React.js (Vite, Tailwind CSS, Lucide icons, React Hot Toast, Axios, React Router)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL

---

## ⚙️ Setup Instructions

### 1. Database Initialization
Ensure PostgreSQL is running locally, then create a database named `unnati_db`. Run the schema initialization script located at [schema.sql](file:///server/config/schema.sql):

```bash
# Example psql execution
psql -U postgres -d unnati_db -f server/config/schema.sql
```

### 2. Environment Configurations

#### Backend `.env`
Create a `.env` file inside `server/` folder:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unnati_db
JWT_SECRET=unnati_super_secure_key_2026_growth
JWT_EXPIRES_IN=7d
```

#### Frontend `.env`
Create a `.env` file inside `client/` folder:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Startup Scripts

#### Start Node.js Server:
```bash
cd server
npm install
node index.js
```

#### Start Vite React App:
```bash
cd client
npm install
npm run dev
```
