
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleGuard, PermissionGuard } from '@/components/auth/RoleBasedAccess';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.name}!
          </p>
        </div>
      </div>

      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertTitle>Role-based access control is active</AlertTitle>
        <AlertDescription>
          You are logged in as a <strong className="capitalize">{user.role}</strong>. Your permissions are enforced by Supabase Row-Level Security.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.role}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your access level in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full mr-2 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-2xl font-bold">
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current status of your account
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Student view */}
        <RoleGuard requiredRole="student">
          <Card>
            <CardHeader>
              <CardTitle>Student Portal</CardTitle>
              <CardDescription>
                Access your exams and study resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>As a student, you can view published exams and attempt them.</p>
              <ul className="mt-4 space-y-1 text-sm">
                <li>• View published exams</li>
                <li>• Submit answers to questions</li>
                <li>• Review your previous submissions</li>
              </ul>
            </CardContent>
          </Card>
        </RoleGuard>

        {/* Teacher view */}
        <RoleGuard requiredRole="teacher">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Portal</CardTitle>
              <CardDescription>
                Manage questions and grade submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>As a teacher, you can create and manage questions for exams.</p>
              <ul className="mt-4 space-y-1 text-sm">
                <li>• View all exams</li>
                <li>• Create and edit questions</li>
                <li>• Grade student submissions</li>
              </ul>
            </CardContent>
          </Card>
        </RoleGuard>

        {/* Examiner view */}
        <RoleGuard requiredRole="examiner">
          <Card>
            <CardHeader>
              <CardTitle>Examiner Portal</CardTitle>
              <CardDescription>
                Create and manage exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>As an examiner, you can create and manage entire exams.</p>
              <ul className="mt-4 space-y-1 text-sm">
                <li>• Create new exams</li>
                <li>• Publish or close exams</li>
                <li>• Manage exam questions</li>
                <li>• Review submissions</li>
              </ul>
            </CardContent>
          </Card>
        </RoleGuard>

        {/* Admin view */}
        <RoleGuard requiredRole="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin Portal</CardTitle>
              <CardDescription>
                Full system management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>As an admin, you have full access to all features.</p>
              <ul className="mt-4 space-y-1 text-sm">
                <li>• Manage users and permissions</li>
                <li>• Create and delete exams</li>
                <li>• Access system settings</li>
                <li>• View all data in the system</li>
              </ul>
            </CardContent>
          </Card>
        </RoleGuard>

        {/* Permissions display card - visible to all users */}
        <Card>
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
            <CardDescription>
              What you can do in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Exams</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <PermissionGuard resource="exams" operation="view">
                    <span className="text-sm text-green-600 dark:text-green-400">✓ View exams</span>
                  </PermissionGuard>
                  <PermissionGuard resource="exams" operation="create" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ Create exams</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Create exams</span>
                  </PermissionGuard>
                  <PermissionGuard resource="exams" operation="update" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ Edit exams</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Edit exams</span>
                  </PermissionGuard>
                  <PermissionGuard resource="exams" operation="delete" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ Delete exams</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Delete exams</span>
                  </PermissionGuard>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Questions</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <PermissionGuard resource="questions" operation="view">
                    <span className="text-sm text-green-600 dark:text-green-400">✓ View questions</span>
                  </PermissionGuard>
                  <PermissionGuard resource="questions" operation="create" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ Create questions</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Create questions</span>
                  </PermissionGuard>
                  <PermissionGuard resource="questions" operation="update" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ Edit questions</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Edit questions</span>
                  </PermissionGuard>
                  <PermissionGuard resource="questions" operation="delete" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ Delete questions</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Delete questions</span>
                  </PermissionGuard>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Users</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <PermissionGuard resource="users" operation="view" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ View users</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ View users</span>
                  </PermissionGuard>
                  <PermissionGuard resource="users" operation="create" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ Create users</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Create users</span>
                  </PermissionGuard>
                  <PermissionGuard resource="users" operation="update" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ Edit users</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Edit users</span>
                  </PermissionGuard>
                  <PermissionGuard resource="users" operation="delete" fallback={
                    <span className="text-sm text-red-600 dark:text-red-400">✗ Delete users</span>
                  }>
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Delete users</span>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
