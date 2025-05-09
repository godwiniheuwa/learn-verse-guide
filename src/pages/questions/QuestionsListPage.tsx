
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/middleware/role-guard";
import { useQuestions } from "@/hooks/api/use-questions";
import { useExamTypes } from "@/hooks/api/use-exam-types";
import { useSubjects } from "@/hooks/api/use-subjects";
import { QuestionDifficulty } from "@/types/exam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, FilterIcon, Trash2Icon, EditIcon, EyeIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

const QuestionsListPage = () => {
  const { user } = useAuth();
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const canCreate = hasPermission(user, 'questions', 'create');
  const canUpdate = hasPermission(user, 'questions', 'update');
  const canDelete = hasPermission(user, 'questions', 'delete');

  const { useAllQuestions, useDeleteQuestion } = useQuestions();
  const { data: questions, isLoading } = useAllQuestions();
  const deleteQuestion = useDeleteQuestion();
  
  const { useAllExamTypes } = useExamTypes();
  const { data: examTypes } = useAllExamTypes();
  
  const { useAllSubjects } = useSubjects();
  const { data: subjects } = useAllSubjects();

  const filteredQuestions = questions?.filter(question => {
    let match = true;
    
    if (subjectId) {
      match = match && question.subject_id === subjectId;
    }
    
    if (difficulty) {
      match = match && question.difficulty === difficulty;
    }
    
    if (searchQuery) {
      match = match && question.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return match;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      deleteQuestion.mutate(id);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Questions</h1>
        {canCreate && (
          <Link to="/questions/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Question
            </Button>
          </Link>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter questions by subject, difficulty or search text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects?.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="flex">
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">Loading questions...</div>
          ) : filteredQuestions && filteredQuestions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question Text</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map(question => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">
                      {question.text.length > 100 ? `${question.text.substring(0, 100)}...` : question.text}
                    </TableCell>
                    <TableCell>{question.type}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </TableCell>
                    <TableCell>
                      {subjects?.find(s => s.id === question.subject_id)?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/questions/${question.id}`}>
                          <Button variant="outline" size="icon">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        {canUpdate && (
                          <Link to={`/questions/${question.id}/edit`}>
                            <Button variant="outline" size="icon">
                              <EditIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {canDelete && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDelete(question.id)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">No questions found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionsListPage;
