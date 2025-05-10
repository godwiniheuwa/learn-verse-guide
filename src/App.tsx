
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import QuestionsListPage from "./pages/questions/QuestionsListPage";
import QuestionFormPage from "./pages/questions/QuestionFormPage";
import QuestionDetailPage from "./pages/questions/QuestionDetailPage";
import CreateAdminPage from "./pages/Auth/CreateAdminPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Question routes */}
              <Route path="/questions" element={
                <ProtectedRoute>
                  <QuestionsListPage />
                </ProtectedRoute>
              } />
              <Route path="/questions/new" element={
                <ProtectedRoute>
                  <QuestionFormPage />
                </ProtectedRoute>
              } />
              <Route path="/questions/:id" element={
                <ProtectedRoute>
                  <QuestionDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/questions/:id/edit" element={
                <ProtectedRoute>
                  <QuestionFormPage />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Admin routes with sidebar layout */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<div>Users Management</div>} />
              <Route path="users/new" element={<div>Add New User</div>} />
              <Route path="exams" element={<div>Exams Management</div>} />
              <Route path="exams/new" element={<div>Create New Exam</div>} />
              <Route path="questions" element={<div>Questions Management</div>} />
              <Route path="questions/new" element={<div>Add New Question</div>} />
              <Route path="settings" element={<div>Admin Settings</div>} />
            </Route>
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/create-admin" element={<CreateAdminPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
