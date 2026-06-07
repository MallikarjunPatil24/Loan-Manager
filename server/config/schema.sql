-- Database Schema for Unnati Loan Services

-- Drop tables if they exist (for easy resetting/seeding)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Table 1: users
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  phone       VARCHAR(15),
  password    VARCHAR(255) NOT NULL,          -- bcrypt hashed
  role        VARCHAR(20) DEFAULT 'customer', -- 'customer' or 'bank_manager'
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Table 2: loans
CREATE TABLE loans (
  id              SERIAL PRIMARY KEY,
  customer_id     INT REFERENCES users(id) ON DELETE CASCADE,
  loan_type       VARCHAR(50),                 -- personal, home, auto, business
  amount          NUMERIC(12, 2) NOT NULL,
  tenure_months   INT NOT NULL,                -- e.g. 12, 24, 36
  interest_rate   NUMERIC(5, 2) NOT NULL,      -- e.g. 10.5 (%)
  purpose         TEXT,
  status          VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, active, closed
  emi_amount      NUMERIC(12, 2),              -- auto-calculated on approval
  start_date      DATE,                        -- set on approval
  end_date        DATE,                        -- start_date + tenure
  manager_note    TEXT,                        -- rejection or approval note
  reviewed_by     INT REFERENCES users(id),    -- bank manager's id
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Table 3: payments
CREATE TABLE payments (
  id            SERIAL PRIMARY KEY,
  loan_id       INT REFERENCES loans(id) ON DELETE CASCADE,
  amount_paid   NUMERIC(12, 2) NOT NULL,
  payment_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  emi_month     INT NOT NULL,                  -- which EMI number (1, 2, 3...)
  status        VARCHAR(20) DEFAULT 'paid',    -- paid, pending, overdue
  recorded_by   INT REFERENCES users(id),      -- manager who recorded
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);
