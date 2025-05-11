
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TeacherDashboardProps {
  data: any;
}

const TeacherDashboard = ({ data }: TeacherDashboardProps) => {
  if (!data) return null;

  const { stats, recentQuestions, relatedExams } = data;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.question_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Questions created by you
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams Using Your Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.exams_using_questions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Exams that include your questions
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Questions</CardTitle>
          <CardDescription>
            Questions you have recently created or updated
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentQuestions && recentQuestions.length > 0 ? (
            <div className="space-y-4">
              {recentQuestions.map((question: any) => (
                <div key={question.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Link to={`/questions/${question.id}`} className="font-medium hover:underline">
                      {question.question_text.length > 70 
                        ? `${question.question_text.substring(0, 70)}...` 
                        : question.question_text}
                    </Link>
                    <div className="flex mt-1 gap-2">
                      <Badge variant="outline" className="text-xs">
                        {question.type}
                      </Badge>
                      <Badge variant={
                        question.difficulty === 'easy' ? 'success' :
                        question.difficulty === 'medium' ? 'warning' : 'destructive'
                      } className="text-xs">
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Link to={`/questions/${question.id}/edit`} className="text-primary hover:underline text-sm">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center">
                You haven't created any questions yet.
              </p>
              <Link to="/questions/new" className="mt-4">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  <FileText className="mr-1 h-4 w-4" /> Create Your First Question
                </Badge>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Exams Using Your Questions</CardTitle>
          <CardDescription>
            Exams that include questions created by you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relatedExams && relatedExams.length > 0 ? (
            <div className="space-y-4">
              {relatedExams.map((exam: any) => (
                <div key={exam.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Link to={`/exams/${exam.id}`} className="font-medium hover:underline">
                      {exam.title}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(exam.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={exam.status === 'published' ? 'default' : 
                         exam.status === 'draft' ? 'secondary' : 'outline'}>
                    {exam.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No exams are currently using your questions</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
