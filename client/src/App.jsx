import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MeetingList from './pages/MeetingList.jsx';
import MeetingForm from './pages/MeetingForm.jsx';
import MeetingDetail from './pages/MeetingDetail.jsx';
import ActionTracker from './pages/ActionTracker.jsx';
import Reports from './pages/Reports.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Departments from './pages/Departments.jsx';
import Users from './pages/Users.jsx';
import Profile from './pages/Profile.jsx';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token, loading } = useAuth();

  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Dashboard Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meetings" element={<MeetingList />} />
            <Route path="/meetings/new" element={<MeetingForm />} />
            <Route path="/meetings/edit/:id" element={<MeetingForm />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/actions" element={<ActionTracker />} />
            <Route path="/reports" element={<Reports />} />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute requiredRole="STATE_ADMIN">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute requiredRole="STATE_ADMIN">
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="STATE_ADMIN">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
