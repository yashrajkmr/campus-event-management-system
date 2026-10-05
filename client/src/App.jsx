import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import EventsDiscoveryPage from './pages/EventsDiscoveryPage';
import EventDetailPage from './pages/EventDetailPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CreateEventPage from './pages/admin/CreateEventPage';
import EditEventPage from './pages/admin/EditEventPage';
import ManageEventsPage from './pages/admin/ManageEventsPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute, RoleRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-10">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsDiscoveryPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student / Authenticated User Routes */}
          <Route
            path="/my-passes"
            element={
              <ProtectedRoute>
                <MyRegistrationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <MyRegistrationsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/create-event"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <CreateEventPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/edit-event/:id"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <EditEventPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/manage-events"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <ManageEventsPage />
              </RoleRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
