
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleGuard, PermissionGuard } from '@/components/auth/RoleBasedAccess';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Users, BookOpen, FileText, Calendar, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import ExaminerDashboard from '@/components/dashboard/ExaminerDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { dashboardData, isLoading, error } = useDashboardData();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Please log in to access your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error loading dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.name}!
          </p>
        </div>

        {/* Role-specific action buttons */}
        <div className="mt-4 md:mt-0 space-x-2">
          <RoleGuard requiredRole="admin">
            <Button asChild size="sm">
              <Link to="/admin/users/new"><Users className="mr-1 h-4 w-4" /> Add User</Link>
            </Button>
          </RoleGuard>
          
          <RoleGuard requiredRole="examiner">
            <Button asChild size="sm">
              <Link to="/exams/new"><Calendar className="mr-1 h-4 w-4" /> Create Exam</Link>
            </Button>
          </RoleGuard>
          
          <RoleGuard requiredRole="teacher">
            <Button asChild size="sm">
              <Link to="/questions/new"><FileText className="mr-1 h-4 w-4" /> Add Question</Link>
            </Button>
          </RoleGuard>
          
          <RoleGuard requiredRole="student">
            <Button asChild size="sm" variant="outline">
              <Link to="/exams"><List className="mr-1 h-4 w-4" /> Browse Exams</Link>
            </Button>
          </RoleGuard>
        </div>
      </div>

      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertTitle>Welcome to your role-specific dashboard</AlertTitle>
        <AlertDescription>
          You are logged in as a <strong className="capitalize">{user.role}</strong>. Your dashboard is personalized for your role.
        </AlertDescription>
      </Alert>

      {/* Role-specific dashboard content */}
      <RoleGuard requiredRole="admin">
        <AdminDashboard data={dashboardData} />
      </RoleGuard>
      
      <RoleGuard requiredRole="teacher">
        <TeacherDashboard data={dashboardData} />
      </RoleGuard>
      
      <RoleGuard requiredRole="student">
        <StudentDashboard data={dashboardData} />
      </RoleGuard>
      
      <RoleGuard requiredRole="examiner">
        <ExaminerDashboard data={dashboardData} />
      </RoleGuard>
    </div>
  );
};

export default Dashboard;
