import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Box, CircularProgress } from "@mui/material";

import { getMe } from "./store/slices/authSlice";
import socket from "./services/socket.service"; // ← IMPORT SOCKET SERVICE

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ResetPassword from "./pages/auth/ResetPassword";

// Public Pages
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Healers from "./pages/Healers";
import ProviderDetail from "./pages/ProviderDetail";
import MeditationContent from "./pages/MeditationContent";
import ContentDetail from "./pages/ContentDetail";

// Protected Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/dashboard/Profile";
import Appointments from "./pages/dashboard/Appointments";
import AppointmentDetail from "./pages/dashboard/AppointmentDetail";
import BookAppointment from "./pages/dashboard/BookAppointment";
import Journal from "./pages/dashboard/Journal";
import JournalDetail from "./pages/dashboard/JournalDetail";
import CreateJournal from "./pages/dashboard/CreateJournal";
import EmotionStats from "./pages/dashboard/EmotionStats";
import Chatbot from "./pages/dashboard/Chatbot";
import Messages from "./pages/dashboard/Messages";
import Payments from "./pages/dashboard/Payments";
import Deposit from "./pages/dashboard/Deposit";
import Settings from "./pages/dashboard/Settings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import ReportManagement from "./pages/admin/ReportManagement";

// Provider Pages
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderAppointments from "./pages/provider/ProviderAppointments";

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token, user, isAuthenticated } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          await dispatch(getMe()).unwrap();
        } catch (error) {
          console.error("Auth error:", error);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [dispatch, token]);

  // ============ SOCKET CONNECTION MANAGEMENT ============
  useEffect(() => {
    if (isAuthenticated && user && token) {
      console.log("🔌 Connecting socket for user:", user.email);
      socket.connect(token);

      // Cleanup on component unmount
      return () => {
        if (!isAuthenticated) {
          console.log("🔌 Disconnecting socket on logout");
          socket.disconnect();
        }
      };
    } else if (!isAuthenticated && socket.isConnected()) {
      // User logged out, disconnect socket
      console.log("🔌 Disconnecting socket on logout");
      socket.disconnect();
    }
  }, [isAuthenticated, user, token]);
  // =====================================================

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CircularProgress sx={{ color: "white" }} size={60} />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/healers" element={<Healers />} />
        <Route path="/provider/:id" element={<ProviderDetail />} />
        <Route path="/meditation" element={<MeditationContent />} />
        <Route path="/content/:id" element={<ContentDetail />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes with DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/:id" element={<AppointmentDetail />} />
        <Route
          path="/book-appointment/:providerId"
          element={<BookAppointment />}
        />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/create" element={<CreateJournal />} />
        <Route path="/journal/:id" element={<JournalDetail />} />
        <Route path="/emotion-stats" element={<EmotionStats />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/content" element={<ContentManagement />} />
        <Route path="/admin/reports" element={<ReportManagement />} />
      </Route>

      {/* Provider Routes (Doctor/Healer) */}
      <Route
        element={
          <ProtectedRoute roles={["doctor", "healer"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route
          path="/provider/appointments"
          element={<ProviderAppointments />}
        />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
