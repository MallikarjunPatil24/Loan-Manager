# Unnati Loan Services

A minimal full-stack loan management application built for learning and demonstration purposes. Supports two roles — bank manager and customer — with a clean separation of concerns across the stack.

---

## Tech Stack

**Frontend** — React 19 (Vite), TailwindCSS v4, React Router v6, Axios  
**Backend** — Node.js, Express.js  
**Database** — PostgreSQL  
**Auth** — JWT (JSON Web Tokens), bcryptjs  

---

## Project Structure

```
unnati-loan-services/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── api/                # Axios instance and API calls
│       ├── components/         # Shared UI components
│       ├── context/            # Auth context (user state)
│       ├── pages/
│       │   ├── auth/           # Login, Signup
│       │   ├── customer/       # Dashboard, Apply, Loans, EMI
│       │   └── manager/        # Dashboard, Loan review, Payments
│       └── routes/             # Protected route wrappers
│
└── server/                     # Express backend
    ├── config/                 # DB connection (pg pool)
    ├── controllers/            # Route handler logic
    ├── middleware/             # JWT auth + role guard
    └── routes/                 # Auth, Loan, Payment routes
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/unnati-loan-services.git
cd unnati-loan-services
```

---

### 2. Set up the database

Open pgAdmin or psql and run:

```sql
CREATE DATABASE unnati_db;
```

Then connect to `unnati_db` and run the schema:

```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  phone       VARCHAR(15),
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) DEFAULT 'customer',
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE loans (
  id              SERIAL PRIMARY KEY,
  customer_id     INT REFERENCES users(id) ON DELETE CASCADE,
  loan_type       VARCHAR(50),
  amount          NUMERIC(12, 2) NOT NULL,
  tenure_months   INT NOT NULL,
  interest_rate   NUMERIC(5, 2) NOT NULL,
  purpose         TEXT,
  status          VARCHAR(20) DEFAULT 'pending',
  emi_amount      NUMERIC(12, 2),
  start_date      DATE,
  end_date        DATE,
  manager_note    TEXT,
  reviewed_by     INT REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id            SERIAL PRIMARY KEY,
  loan_id       INT REFERENCES loans(id) ON DELETE CASCADE,
  amount_paid   NUMERIC(12, 2) NOT NULL,
  payment_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  emi_month     INT NOT NULL,
  status        VARCHAR(20) DEFAULT 'paid',
  recorded_by   INT REFERENCES users(id),
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

---

### 3. Configure environment variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/unnati_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

> If your PostgreSQL password contains special characters (e.g. `@`), URL-encode them. `@` becomes `%40`.

Create a `.env` file inside the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 4. Install dependencies and run

**Backend**
```bash
cd server
npm install
node index.js
```

**Frontend** (in a separate terminal)
```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend runs at `http://localhost:5000`

---

## API Overview

### Auth — `/api/auth`

| Method | Endpoint  | Access | Description          |
|--------|-----------|--------|----------------------|
| POST   | /signup   | Public | Register new user    |
| POST   | /login    | Public | Login, returns JWT   |
| GET    | /me       | Auth   | Get current user     |

### Loans — `/api/loans`

| Method | Endpoint          | Access   | Description                      |
|--------|-------------------|----------|----------------------------------|
| POST   | /apply            | Customer | Submit loan application          |
| GET    | /my               | Customer | Get own loans                    |
| GET    | /                 | Manager  | Get all loans                    |
| GET    | /:id              | Both     | Get single loan                  |
| PATCH  | /:id/approve      | Manager  | Approve and set EMI              |
| PATCH  | /:id/reject       | Manager  | Reject with note                 |

### Payments — `/api/payments`

| Method | Endpoint           | Access  | Description                  |
|--------|--------------------|---------|------------------------------|
| POST   | /record            | Manager | Record an EMI payment        |
| GET    | /loan/:loanId      | Both    | Get payments for a loan      |

---

## EMI Calculation

Uses the **reducing balance method**:

```js
function calculateEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / tenureMonths;
  return (principal * r * Math.pow(1 + r, tenureMonths)) /
         (Math.pow(1 + r, tenureMonths) - 1);
}
```

EMI is calculated and stored when a manager approves the loan.

---

## User Roles

**Customer**
- Sign up and log in
- Apply for a loan (personal, home, auto, business)
- View loan status and EMI schedule
- Track payment history

**Bank Manager**
- View all loan applications
- Approve or reject with notes
- Record EMI payments
- Monitor overdue loans

---

## Loan Status Flow

```
pending  ->  approved  ->  active  ->  closed
         ->  rejected
```

---

## Environment Notes

- Never commit `.env` files — they are listed in `.gitignore`
- JWT secret should be a long random string in production
- PostgreSQL must be running locally before starting the server

---

## Author

Mallikarjuna  
Built as a full-stack project — Unnati Loan Services
