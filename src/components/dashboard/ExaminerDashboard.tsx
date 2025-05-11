
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, AlertCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExaminerDashboardProps {
  data: any;
}

const statusColors = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800"
};

const ExaminerDashboard = ({ data }: ExaminerDashboardProps) => {
  if (!data) return null;

  const { stats, recentExams } = data;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Exams</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.exam_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Exams created by you
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link to="/exams/new">
                  <Plus className="mr-1 h-4 w-4" /> New Exam
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/questions/new">
                  <FileText className="mr-1 h-4 w-4" /> Add Question
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Exams</CardTitle>
          <CardDescription>
            Exams you have recently created or updated
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentExams && recentExams.length > 0 ? (
            <div className="space-y-4">
              {recentExams.map((exam: any) => (
                <div key={exam.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <Link to={`/exams/${exam.id}`} className="font-medium hover:underline">
                      {exam.title}
                    </Link>
                    <div className="flex mt-1 items-center">
                      <span className="text-sm text-muted-foreground mr-2">
                        Created: {new Date(exam.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant={
                        exam.status === 'published' ? 'default' :
                        exam.status === 'draft' ? 'secondary' : 'outline'
                      }>
                        {exam.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/exams/${exam.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/exams/${exam.id}/questions`}>
                        Manage Questions
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center">
                You haven't created any exams yet.
              </p>
              <Button asChild className="mt-4">
                <Link to="/exams/new">
                  <Plus className="mr-1 h-4 w-4" /> Create Your First Exam
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Exams</CardTitle>
          <CardDescription>
            Actions for your existing exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/exams?status=draft" className="block">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Draft Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">View and edit your unpublished exams</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/exams?status=published" className="block">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Published Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Manage your active exams</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/exams?status=archived" className="block">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Archived Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Access your past exams</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExaminerDashboard;
