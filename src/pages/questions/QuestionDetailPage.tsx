
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/middleware/role-guard";
import { useQuestions } from "@/hooks/api/use-questions";
import { useSubjects } from "@/hooks/api/use-subjects";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EditIcon, Trash2Icon } from "lucide-react";

const QuestionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { useQuestion, useDeleteQuestion } = useQuestions();
  const { data: question, isLoading } = useQuestion(id!);
  const deleteQuestion = useDeleteQuestion();
  
  const { useAllSubjects } = useSubjects();
  const { data: subjects } = useAllSubjects();
  
  const subject = subjects?.find(s => s.id === question?.subject_id);
  const canUpdate = hasPermission(user, 'questions', 'update');
  const canDelete = hasPermission(user, 'questions', 'delete');

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      deleteQuestion.mutate(id!, {
        onSuccess: () => {
          // Redirect to questions list after deletion
          window.location.href = "/questions";
        }
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading question details...</div>;
  }

  if (!question) {
    return <div className="container mx-auto py-8">Question not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Question Details</h1>
        <div className="flex gap-2">
          <Link to="/questions">
            <Button variant="outline">Back to List</Button>
          </Link>
          {canUpdate && (
            <Link to={`/questions/${question.id}/edit`}>
              <Button variant="outline">
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2Icon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {question.text}
          </CardTitle>
          <CardDescription className="flex flex-wrap gap-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {question.difficulty}
            </span>
            <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
              {question.type}
            </span>
            {subject && (
              <span className="inline-block px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-semibold">
                {subject.name}
              </span>
            )}
            {question.tags && question.tags.map((tag: string) => (
              <span key={tag} className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-semibold">
                {tag}
              </span>
            ))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {question.type === 'MCQ' && question.options && (
              <div>
                <h3 className="font-medium mb-2">Options:</h3>
                <ul className="list-disc pl-5">
                  {question.options.map((option: string, index: number) => (
                    <li key={index} className={`mb-1 ${
                      Array.isArray(question.correct_answer) 
                        ? question.correct_answer.includes(option) ? 'font-bold text-green-600' : ''
                        : question.correct_answer === option ? 'font-bold text-green-600' : ''
                    }`}>
                      {option} 
                      {Array.isArray(question.correct_answer) 
                        ? question.correct_answer.includes(option) ? ' (Correct)' : ''
                        : question.correct_answer === option ? ' (Correct)' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {question.type === 'theory' && question.correct_answer && (
              <div>
                <h3 className="font-medium mb-2">Sample Answer:</h3>
                <p className="bg-gray-50 p-3 rounded">{question.correct_answer}</p>
              </div>
            )}

            {question.media_urls && question.media_urls.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Media:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {question.media_urls.map((url: string, index: number) => (
                    <div key={index} className="border rounded overflow-hidden">
                      {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img src={url} alt={`Media ${index + 1}`} className="w-full h-auto" />
                      ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video controls className="w-full h-auto">
                          <source src={url} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="p-4 text-center">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View File
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          <div>
            Created: {new Date(question.created_at).toLocaleString()}
            <br />
            Last Updated: {new Date(question.updated_at).toLocaleString()}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuestionDetailPage;
