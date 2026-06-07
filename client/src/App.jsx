import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Unauthorized from './pages/auth/Unauthorized';
import ForgotPassword from './pages/auth/ForgotPassword';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import ApplyLoan from './pages/customer/ApplyLoan';
import MyLoans from './pages/customer/MyLoans';
import CustomerLoanDetails from './pages/customer/LoanDetails';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import AllLoans from './pages/manager/AllLoans';
import ManagerLoanDetails from './pages/manager/LoanDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0F172A',
              color: '#F8FAFC',
              fontSize: '13px',
              border: '1px solid #1E293B',
              borderRadius: '8px'
            }
          }} 
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Customer Protected Routes */}
          <Route
            path="/customer/*"
            element={
              <ProtectedRoute allowedRole="customer">
                <SidebarLayout>
                  <Routes>
                    <Route path="dashboard" element={<CustomerDashboard />} />
                    <Route path="apply" element={<ApplyLoan />} />
                    <Route path="loans" element={<MyLoans />} />
                    <Route path="loans/:id" element={<CustomerLoanDetails />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </SidebarLayout>
              </ProtectedRoute>
            }
          />

          {/* Manager Protected Routes */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute allowedRole="bank_manager">
                <SidebarLayout>
                  <Routes>
                    <Route path="dashboard" element={<ManagerDashboard />} />
                    <Route path="loans" element={<AllLoans />} />
                    <Route path="loans/:id" element={<ManagerLoanDetails />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </SidebarLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
