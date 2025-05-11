
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminDashboardProps {
  data: any;
}

const AdminDashboard = ({ data }: AdminDashboardProps) => {
  if (!data) return null;

  const { stats, recentUsers, recentExams } = data;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Users registered in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.student_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active student accounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_exams || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All exams in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_questions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Questions in the question bank
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Newly registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                    <Badge>{user.role}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent users found</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Exams</CardTitle>
            <CardDescription>
              Latest exams created in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentExams && recentExams.length > 0 ? (
              <div className="space-y-4">
                {recentExams.map((exam: any) => (
                  <div key={exam.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <Link to={`/exams/${exam.id}`} className="font-medium hover:underline">
                        {exam.title}
                      </Link>
                      <span className="text-sm text-muted-foreground">By: {exam.created_by_name}</span>
                    </div>
                    <Badge variant={exam.status === 'published' ? 'default' : 
                           exam.status === 'draft' ? 'secondary' : 'outline'}>
                      {exam.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent exams found</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>
            Quick access to administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/admin/users">
            <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground">
              <Users className="mr-1 h-4 w-4" /> Manage Users
            </Badge>
          </Link>
          <Link to="/admin/exams">
            <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground">
              <BookOpen className="mr-1 h-4 w-4" /> Manage Exams
            </Badge>
          </Link>
          <Link to="/admin/questions">
            <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground">
              <FileText className="mr-1 h-4 w-4" /> Manage Questions
            </Badge>
          </Link>
          <Link to="/admin/settings">
            <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground">
              <Clock className="mr-1 h-4 w-4" /> System Settings
            </Badge>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
