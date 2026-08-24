import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import DashboardHome from "./pages/DashboardHome";
import Account from "./pages/dashboard/Account";
import Announcements from "./pages/dashboard/Announcements";
import Support from "./pages/dashboard/Support";
import AffiliateDashboard from "./pages/dashboard/AffiliateDashboard";
import ProducerDashboard from "./pages/dashboard/ProducerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import MyCourses from "./pages/MyCourses";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Checkout from "./pages/Checkout";
import CoursePlayer from "./pages/dashboard/CoursePlayer";

function AppRouter() {
  const location = useLocation();
  // Handle OAuth callback synchronously during render
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/affiliates" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/:courseId" element={
        <ProtectedRoute><Checkout /></ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardHome /></ProtectedRoute>
      } />
      <Route path="/dashboard/account" element={
        <ProtectedRoute><Account /></ProtectedRoute>
      } />
      <Route path="/dashboard/announcements" element={
        <ProtectedRoute><Announcements /></ProtectedRoute>
      } />
      <Route path="/dashboard/support" element={
        <ProtectedRoute><Support /></ProtectedRoute>
      } />
      <Route path="/dashboard/courses" element={
        <ProtectedRoute><MyCourses /></ProtectedRoute>
      } />
      <Route path="/dashboard/courses/:courseId/modules/:moduleId" element={
        <ProtectedRoute><CoursePlayer /></ProtectedRoute>
      } />
      <Route path="/dashboard/courses/:courseId/modules/:moduleId/lessons/:lessonId" element={
        <ProtectedRoute><CoursePlayer /></ProtectedRoute>
      } />
      <Route path="/dashboard/affiliate" element={
        <ProtectedRoute roles={["affiliate", "producer"]}><AffiliateDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/producer" element={
        <ProtectedRoute roles={["producer"]}><ProducerDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/producer/course/:id" element={
        <ProtectedRoute roles={["producer"]}><ProducerDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/admin" element={
        <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
