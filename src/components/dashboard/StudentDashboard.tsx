
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, Book, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentDashboardProps {
  data: any;
}

const StudentDashboard = ({ data }: StudentDashboardProps) => {
  if (!data) return null;

  const { availableExams } = data;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Exams</CardTitle>
          <CardDescription>
            Exams you can currently take
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableExams && availableExams.length > 0 ? (
            <div className="space-y-4">
              {availableExams.map((exam: any) => (
                <Card key={exam.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-3">
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <CardDescription>
                      {exam.description?.length > 100 
                        ? `${exam.description.substring(0, 100)}...` 
                        : exam.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(exam.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge>Available</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 flex justify-end pt-3 pb-3">
                    <Button asChild size="sm">
                      <Link to={`/exams/${exam.id}`}>
                        <Book className="h-4 w-4 mr-2" /> View Exam
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center">
                There are no available exams at the moment.
              </p>
              <p className="text-muted-foreground text-center text-sm mt-1">
                Check back later for new exams.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Study Resources</CardTitle>
            <CardDescription>
              Access study materials to prepare for exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/resources/practice">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground w-full flex justify-between items-center">
                  <span>Practice Questions</span>
                  <span>→</span>
                </Badge>
              </Link>
              <Link to="/resources/tutorials">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground w-full flex justify-between items-center">
                  <span>Video Tutorials</span>
                  <span>→</span>
                </Badge>
              </Link>
              <Link to="/resources/documents">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground w-full flex justify-between items-center">
                  <span>Study Documents</span>
                  <span>→</span>
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Helpful resources for students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/profile">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground w-full flex justify-between items-center">
                  <span>Update Profile</span>
                  <span>→</span>
                </Badge>
              </Link>
              <Link to="/exams/history">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground w-full flex justify-between items-center">
                  <span>Exam History</span>
                  <span>→</span>
                </Badge>
              </Link>
              <Link to="/help/faq">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground w-full flex justify-between items-center">
                  <span>FAQ & Help</span>
                  <span>→</span>
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
